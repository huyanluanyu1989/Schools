import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import Action from '$redux/actions/School'
import { withRouter } from 'react-router'
import styles from './classRoom.less'
import { Nav, Modal, Input, Form, FormItem, Button, Confirm, Message, Loading } from '@microduino/micdesign'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router'
import classCourseImg from '../../../../static/images/school/class_action.png'
import ErrorPage from '$components/ErrorPage'
import School404 from '$src/modules/School/components/School404'
import { deepGet } from '$utils'
import { classRoom } from '../../../routes/School'
import { injectIntl, intlShape } from 'react-intl'

const mapStateToProps = state => ({
    detail: state.classDetail
})
const mapDispatchToProps = (dispatch, props) => {
    return {
        getDetail: () => {
            return dispatch(Action.classDetail(props.match.params.class))
        },
        saveClass: (school, body, id) => dispatch(Action.save(school, body, id)),
        delClass: () => {
            return dispatch(Action.remove(props.match.params.class))
        },
        push: bindActionCreators(push, dispatch)
    }
}
@injectIntl
@withRouter
@connect(
    mapStateToProps,
    mapDispatchToProps
)
@asyncDataLoader
export default class ClassDetail extends Component {
    static propTypes = {
        registerAsyncDataLoader: PropTypes.func,
        getDetail: PropTypes.func,
        detail: PropTypes.object,
        saveClass: PropTypes.func,
        delClass: PropTypes.func,
        match: PropTypes.shape(),
        pending: PropTypes.bool,
        error: PropTypes.bool,
        children: PropTypes.object,
        push: PropTypes.func,
        intl: intlShape
    }
    state = { visible: false, reload: true, showDiaLog: false, nickname: this.props.match.params.nickname }
    handleOk = () => {
        this.setState({ visible: true })
    }
    handleCancel = () => {
        this.setState({ visible: false })
    }
    handleValidSubmit = () => {
        if (!this.form.state.isValid) {
            this.form.submit()
            return
        }
        const body = { ...this.form.getModel() }
        const { school, _id } = this.props.detail.data
        this.props.saveClass(school, body, _id).then(res => {
            this.setState({ loading: false, visible: false })
            Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.updateSuccess' }))
            this.props.getDetail()
        }).catch(error => {
            console.error(error)
            this.setState({ loading: false })
        })
    }
    handleDel = () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.surePerform' }), () => {
            this.props.delClass().then((res) => {
                Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.delSucess' }))
                this.props.push(classRoom.fill({ schoolId: this.props.match.params.schoolId }))
            }).catch(error => {
                console.error(error)
                Message.error(error.message)
            })
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.cancel' }) })
    }
    classGraduation = () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.surePerform' }), () => {
            const body = { status: deepGet(this.props.detail, 'data.status') === 0 ? 1 : 0 }
            const { school, _id } = this.props.detail.data
            this.props.saveClass(school, body, _id).then(res => {
                Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.performSuccess' }))
                this.setState({ loading: false, visible: false })
                this.props.getDetail()
            }).catch(error => {
                console.error(error)
                this.setState({ loading: false })
            })
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.cancel' }) })
    }
    navClick = (i, v) => {
        switch (v) {
            case this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.update' }):
                this.handleOk()
                break
            case this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.graduation' }):
                this.classGraduation()
                break
            case this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.cancleGraduation' }):
                this.classGraduation()
                break
            case this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.delete' }):
                this.handleDel()
                break
        }
    }

    constructor(props) {
        super(props)
        this.nicknameValidation = {
            validations: {
                lengthCheck: { min: 0, max: 20 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.ClassDetail.mostAllow20' })
            }
        }
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        await this.props.getDetail()
    }

    render() {
        const { pending, error, detail, children, intl } = this.props
        if (error) {
            return <ErrorPage />
        }
        if (pending) {
            return <Loading />
        }
        // TODO  404 catch的优化处理
        if (detail.error === 404) {
            return <School404 />
        }
        const list = [intl.formatMessage({ id: 'intl.module.School.ClassDetail.update' }), deepGet(detail, 'data.status') === 0 ? intl.formatMessage({ id: 'intl.module.School.ClassDetail.graduation' }) : intl.formatMessage({ id: 'intl.module.School.ClassDetail.cancleGraduation' }), intl.formatMessage({ id: 'intl.module.School.ClassDetail.delete' })]
        return <div className={styles.detail}>
            <div className={styles.topWp}>
                {children}
                <span>{intl.formatMessage({ id: 'intl.module.School.ClassDetail.classInviteCode' })}：<em>{deepGet(detail, 'data.genCode')}</em></span>
                <Nav onClick={this.navClick} arrow list={list}>
                    <img src={classCourseImg} />
                </Nav>
            </div>
            <Modal className={'schoolFeatureModal'}
                Button={<Fragment>
                    <Button onClick={this.handleValidSubmit} size={'small'}>{intl.formatMessage({ id: 'intl.module.School.ClassDetail.update' })}</Button>
                    <Button size={'small'} onClick={this.handleCancel}>{intl.formatMessage({ id: 'intl.module.School.ClassDetail.cancle' })}</Button>
                </Fragment>}
                width={500} height={200} visible={this.state.visible} title={intl.formatMessage({ id: 'intl.module.School.ClassDetail.className' })} onCancel={this.handleCancel}>
                <Form className={'formInline'} ref={(form) => {
                    this.form = form
                }}>
                    <FormItem required {...this.nicknameValidation} value={deepGet(detail, 'data.nickname')} name={'nickname'}>
                        <Input />
                    </FormItem>
                </Form>
            </Modal>
        </div>
    }
}
