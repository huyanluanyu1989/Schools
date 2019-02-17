import React, { Component } from 'react'
import styles from './lessonForm.less'
import ErrorPage from '$components/ErrorPage'
import { Message, Loading, Input, Radio, Form, FormItem, Button, Confirm } from '@microduino/micdesign'
import connect from 'react-redux/es/connect/connect'
import PropTypes from 'prop-types'
import Modules from '../components/Modules'
import IntlFileUpload from '$components/IntlFileUpload'
import IntlEditor from '$components/IntlEditor'
import Action from '$redux/actions/Lesson'
import { bindActionCreators } from 'redux'
import { goBack } from 'connected-react-router'
import { API_SERVER_ERROR } from '$restful'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import { deepGet } from '$utils'
import { injectIntl, intlShape } from 'react-intl'

// import { AlertError } from '$redux/store/errorHandle'
const mapStateToProps = state => ({
    detail: state.currentDetail.data,
    pending: state.currentDetail.pending,
    error: state.currentDetail.error
})

const mapDispatchToProps = (dispatch, props) => ({
    goBack: bindActionCreators(goBack, dispatch),
    save: (body) => dispatch(Action.save(props.match.params.course, props.match.params.lessonId, body)),
    getDetail: () => {
        return dispatch(Action.detail(props.match.params.lessonId))
    }
})
@injectIntl
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class LessonForm extends Component {
    static propTypes = {
        pending: PropTypes.bool,
        error: PropTypes.bool,
        getDetail: PropTypes.func,
        goBack: PropTypes.func,
        save: PropTypes.func,
        detail: PropTypes.object,
        match: PropTypes.shape(),
        registerAsyncDataLoader: PropTypes.func,
        intl: intlShape

    }
    onSetSuccess = (onSuccess) => {
        this.onSuccess = onSuccess
    }
    handleGetModules = (data) => {
        this.modules = data
    }
    radioData = [{ val: '1', title: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.uploadLocal' }) }, { val: '2', title: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.videoAddress' }) }, { val: '3', title: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.selfBuilt' }) }]

    state = { type: this.radioData[0].val }

    radioChange = (v) => {
        this.setState({ type: v.toString() })
    }
    handleBack = () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.isGiveUpCreate' }), () => {
            this.props.goBack()
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.cancel' }) })
    }
    handleSave = async () => {
        if (this.state.type === '3') {
            try {
                await this.onSuccess()
            } catch (error) {
                Message.error(error.message)
                throw error
            }
        }

        const body = { modules: this.modules, ...this.form.getModel() }
        this.props.save(body).then(res => {
            Message.success(this.props.match.params.lessonId ? this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.saveSuccess' }) : this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.createSuccess' }))
            this.props.goBack()
        }).catch(error => {
            console.error(error)
            if (error.errorCode && error.errorCode === API_SERVER_ERROR.INPUT_ERROR) {
                return Form.inputServerError(error, [this.form], false)
            }
            throw error
        })
    }
    titleValidation = {
        validations: {
            lengthCheck: { min: 0, max: 20 }
        },

        validationErrors: {
            lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.allow20' })
        }
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        if (this.props.match.params.lessonId) {
            const res = await this.props.getDetail()
            this.setState({ type: deepGet(res, 'value.data.meta.type', '').toString() })
        }
    }

    render() {
        const { pending, error, intl } = this.props
        let { detail } = this.props
        if (!this.props.match.params.lessonId) {
            detail = {}
        }
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }

        let editorTools = ['image', 'latex', 'code', 'jupyter', 'iframe', 'link']
        return <div className={styles.lessonForm}>

            <div className={styles.container}>
                <Form ref={(form) => {
                    this.form = form
                }} onValidSubmit={this.handleSave} className={'formInline'}>
                    <div className={styles.wp1}>
                        <p className={styles.title}>{intl.formatMessage({ id: 'intl.module.School.Lesson.lessonName' })}</p>
                        <FormItem
                            {...this.titleValidation}
                            value={deepGet(detail, 'title', '')} required name={'title'}>
                            <Input placeholder={intl.formatMessage({ id: 'intl.module.School.Lesson.inputWithin20' })} />
                        </FormItem>
                        <p className={`${styles.title} ${styles.mt20}`}>{intl.formatMessage({ id: 'intl.module.School.Lesson.lessonCourseware' })}</p>
                        <FormItem value={this.state.type} name={'meta[type]'}>
                            <Radio onChange={this.radioChange} data={this.radioData} />
                        </FormItem>
                        {(() => {
                            switch (this.state.type) {
                                case '1':
                                    return <FormItem value={deepGet(detail, 'contents.courseware')}
                                        name='contents[courseware]'>
                                        <IntlFileUpload onError={(err) => {
                                            Message.error(err)
                                        }}
                                        fileReg={/\.(ppt|pptx|doc|docx)$/}
                                        accept={''}
                                        maxSize={50} showStyle={'btn'} />
                                    </FormItem>
                                case '2':
                                    return <FormItem value={deepGet(detail, 'contents.video')} key={'contents.video'}
                                        name={'contents[video]'}>
                                        <Input placeholder={intl.formatMessage({ id: 'intl.module.School.Lesson.withoutVideoAddress' })} />
                                    </FormItem>
                                case '3':
                                    return <FormItem key={'contents.substance'}
                                        value={deepGet(detail, 'contents.substance')} required
                                        name='contents[substance]'>
                                        <IntlEditor setOnSuccess={this.onSetSuccess} tools={editorTools} />
                                    </FormItem>
                            }
                        })()}

                    </div>
                    <div className={styles.wp2}>
                        <p className={styles.title}>{intl.formatMessage({ id: 'intl.module.School.Lesson.attachment' })}<span>{intl.formatMessage({ id: 'intl.module.School.Lesson.downLoadLocal' })}</span></p>
                        <FormItem value={deepGet(detail, 'contents.attachment')} name='contents[attachment]'>
                            <IntlFileUpload onError={(err) => {
                                Message.error(err)
                            }} accept={''} zipReader fileReg={/\.(zip)$/}
                            maxSize={50} showStyle={'btn'} />
                        </FormItem>
                        <div>
                            <div className={styles.kitWp}>
                                <Modules value={detail.modules} sendData={this.handleGetModules} />
                            </div>

                        </div>
                    </div>
                    <div className={styles.btnWp}>
                        <Button type={'submit'}>{this.props.match.params.lessonId ? intl.formatMessage({ id: 'intl.module.School.Lesson.saveLesson' }) : intl.formatMessage({ id: 'intl.module.School.Lesson.createLesson' })}</Button>
                        <Button onClick={this.handleBack}>{intl.formatMessage({ id: 'intl.module.School.Lesson.cancleCreate' })}</Button>
                    </div>
                </Form>
            </div>
        </div>
    }
}
