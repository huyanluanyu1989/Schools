import React, { Component } from 'react'
import { Message, Input, Form, FormItem, Checkbox, TextArea, Button, Loading, Confirm } from '@microduino/micdesign'
import { deepGet } from '$utils'
import PropTypes from 'prop-types'
import styles from './courseForm.less'
import Action from '../../../redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import { withRouter } from 'react-router'
import ErrorPage from '$components/ErrorPage'
import IntlFileUpload from '../../../components/IntlFileUpload'
import { get, set } from 'lodash'
import { API_SERVER_ERROR } from '$restful'
import { goBack } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import School404 from '$src/modules/School/components/School404'
import selectCover from '../../../../static/images/school/cover_mask.png'
import { injectIntl, intlShape } from 'react-intl'
const mapStateToProps = state => ({
    list: state.currentPageList.data,
    total: state.currentPageList.total,
    detail: state.currentDetail
})

const mapDispatchToProps = (dispatch, props) => ({
    goBack: bindActionCreators(goBack, dispatch),
    saveCourse: (body) => dispatch(Action.saveCourse(props.match.params.schoolId, body, props.match.params.courseId)),
    getDetail: () => {
        return dispatch(Action.courseDetail(props.match.params.courseId && props.match.params.courseId))
    },
    courseCoverImg: () => dispatch(Action.courseCoverImg())
})
@injectIntl
@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class CourseForm extends Component {
    static propTypes = {
        goBack: PropTypes.func,
        getDetail: PropTypes.func,
        detail: PropTypes.object,
        match: PropTypes.shape(),
        saveCourse: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        intl: intlShape,
        reloadAsyncData: PropTypes.func,
        courseCoverImg: PropTypes.func
    }
    state = { ageUpper: false, coverImg: '', coverSelectImg: '', isSelect: false }
    handleBack = () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.notCreatPrompt' }),
            () => {
                this.props.goBack()
            }, {
                sure: this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.sure' }),
                cancel: this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.cancle' })
            })
    }
    saveCourse = () => {
        const body = this.form.getModel()
        set(body, 'meta.school', get(this, 'props.match.params.schoolId'))
        this.props.saveCourse(body).then(res => {
            Message.success(this.props.match.params.courseId
                ? this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.saveSucess' })
                : this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.createSucess' }))
            this.props.goBack()
        }).catch(error => {
            console.error(error)
            if (error.message === this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.maxAgeIsNull' })) {
                Message.error(this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.maxAgeNotNull' }))
            }
            if (error.errorCode && error.errorCode === API_SERVER_ERROR.INPUT_ERROR) {
                return Form.inputServerError(error, [this.form], false)
            }
            throw error
        })
    }
    checkBoxChange = (v) => {
        this.setState({ ageUpper: v })
    }
    selectCoverImg = (url) => () => {
        this.setState({
            coverSelectImg: url,
            isSelect: true
        })
    }
    fileSuccess = (data) => {
        this.setState({
            coverSelectImg: data[0],
            isSelect: false
        })
    }

    constructor(props) {
        super(props)
        this.titleValidation = {
            validations: {
                lengthCheck: { min: 0, max: 20 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.allow20' })
            }
        }
        this.substanceValidation = {
            validations: {
                lengthCheck: { min: 0, max: 200 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.allow200' })
            }
        }
        props.courseCoverImg().then(res => {
            this.setState({
                coverImg: res.data['1'].url
            })
        })
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        if (this.props.match.params.courseId) {
            await this.props.getDetail()
        }
    }
    async componentDidLoadAsyncData(setState) {
        const ageUpper = deepGet(this.props.detail.data, 'meta.toplimit')
        setState({
            ageUpper
        })
    }

    render() {
        const { pending, error, detail } = this.props
        const { data } = detail
        const { ageUpper, coverImg, coverSelectImg, isSelect } = this.state
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }

        // TODO  404 catch的优化处理
        if (detail.error === 404) {
            return <School404 />
        }
        const fileUpProps = { tipWidth: 280, tipHeight: 210, width: 280, height: 210 }
        return (

            <div className={styles.courseForm}>
                <div className={styles.clearFix}>
                    <Form className={'formInline'} onValidSubmit={this.saveCourse} ref={(form) => {
                        this.form = form
                    }}>
                        <div className={styles.left}>
                            <p className={styles.title}>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.courseTitle' })}</p>
                            <FormItem required {...this.titleValidation} name={'title'} value={deepGet(data, 'title', '')}>
                                <Input placeholder={this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.within20' })} />
                            </FormItem>
                            <div className={styles.checkAgeWp}>
                                <span className={styles.title}>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.applyOld' })}</span>
                                <FormItem name={'meta[toplimit]'} value={deepGet(data, 'meta.toplimit')}>
                                    <Checkbox onChange={this.checkBoxChange} text={this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.agree' })}>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.notToplimit' })}</Checkbox>
                                </FormItem>
                            </div>
                            <div className={styles.AgeWp}>
                                <FormItem name={'meta[minAge]'} value={deepGet(data, 'meta.minAge', 0).toString()}>
                                    <Input />
                                </FormItem>
                                <span>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.oldTo' })}</span>
                                <FormItem name={'meta[maxAge]'} value={deepGet(data, 'meta.maxAge')}>
                                    <Input disabled={ageUpper} />
                                </FormItem>
                                <span>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.old' })}</span>
                            </div>
                            <p className={styles.title}>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.courseIntro' })}</p>
                            <FormItem required {...this.substanceValidation} name={'contents[substance]'}
                                value={deepGet(data, 'contents.substance')}>
                                <TextArea placeholder={this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.within200' })} />
                            </FormItem>
                        </div>
                        <div className={styles.right}>
                            <p className={styles.title}>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.courseCover' })}</p>
                            <div className={styles.coverImg}>
                                <FormItem
                                    key={coverSelectImg}
                                    value={!coverSelectImg ? deepGet(data, 'image', '') : coverSelectImg}
                                    name='image' required>
                                    <IntlFileUpload onSuccess={this.fileSuccess} onError={(e) => { Message.error(e) }} showStyle={'autoSize'}
                                        {...fileUpProps} />
                                </FormItem>
                                <div>
                                    <img src={coverImg} onClick={this.selectCoverImg(coverImg)} />
                                    {
                                        (() => {
                                            let content = []
                                            isSelect && content.push(
                                                <div key=''>
                                                    <img src={selectCover} />
                                                </div>
                                            )
                                            return content
                                        })()
                                    }
                                </div>
                            </div>
                            <div className={styles.btnWP}>
                                <Button type={'submit'}>{!this.props.match.params.courseId ? this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.createCourse' }) : this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.saveCourse' })}</Button>
                                <Button className={styles.cancle} onClick={this.handleBack}>{data.title ? this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.notEdit' }) : this.props.intl.formatMessage({ id: 'intl.module.School.CourseForm.notCreate' })}</Button>
                            </div>
                        </div>
                    </Form>
                </div>

            </div>

        )
    }
}
