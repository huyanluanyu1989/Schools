import React, { Component } from 'react'
import ClassApplyList from './ClassApplyList'
import styles from './classList.less'
import { Checkbox, Button, Pagination, Modal, Input, Loading, Form, FormItem, Message } from '@microduino/micdesign'
import classStu from '../../../../static/images/school/class_stu.png'
import classCourseImg from '../../../../static/images/school/class_course.png'
import Action from '../../../redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import { classCourse } from '../../../routes/School'
import EmptyDataPlaceHolder from '../../../components/EmptyDataPlaceHolder'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router'
import ListInfo from '../components/ListInfo'
import ErrorPage from '$components/ErrorPage'
import { deepGet } from '$utils'
import School404 from '$src/modules/School/components/School404'
import { injectIntl, intlShape } from 'react-intl'

const PAGE_SIZE = 12
const mapStateToProps = state => ({
    applyTotal: state.applyPageList.total,
    list: state.currentPageList.data,
    total: state.currentPageList.total,
    identityDetail: state.currentDetail
})

const mapDispatchToProps = (dispatch, props) => ({
    getApplyList: (currentPage = 1, reload = true, options = {}) => {
        const params = {
            ...options,
            limit: 1000,
            skip: 0
        }
        return dispatch(Action.schoolClassApplyLists(params, reload))
    },
    saveClass: (school, body, id) => dispatch(Action.save(school, body, id)),
    setIdentity: (school, body, id) => dispatch(Action.setIdentity(school, body, id)),
    getIdentityDetail: () => dispatch(Action.identityDetail(props.match.params.schoolId)),
    getClass: (currentPage = 1, reload = false, options = {}) => {
        const params = {
            ...options,
            limit: PAGE_SIZE,
            skip: (currentPage - 1) * PAGE_SIZE
        }
        return dispatch(Action.classList(props.match.params.schoolId, params, reload))
    },
    push: bindActionCreators(push, dispatch)
})
@injectIntl
@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class ClassList extends Component {
    static propTypes = {
        getApplyList: PropTypes.func,
        applyTotal: PropTypes.number,
        pending: PropTypes.bool,
        list: PropTypes.array,
        total: PropTypes.number,
        getClass: PropTypes.func,
        saveClass: PropTypes.func,
        setIdentity: PropTypes.func,
        getIdentityDetail: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        match: PropTypes.shape(),
        error: PropTypes.bool,
        identityDetail: PropTypes.object,
        // push: func
        reloadAsyncData: PropTypes.func,
        intl: intlShape
    }
    state = {
        showGraduation: false,
        reload: true,
        visible: false,
        currentPage: 1,
        joinVisible: false,
        identityVisible: false
    }
    onChange = (page) => {
        this.setState({ currentPage: page })
    }
    handleValidSubmit = () => {
        if (!this.form.state.isValid) {
            this.form.submit()
            return
        }
        const body = { ...this.form.getModel() }
        const { schoolId } = this.props.match.params
        this.props.saveClass(schoolId, body).then(res => {
            this.setState({ loading: false, visible: false })
            this.props.getClass(1, true)
            Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.creatClassSuccess' }))
        }).catch(error => {
            console.error(error)
            this.setState({ loading: false })
        })
    }
    saveIdentity = () => {
        if (!this.form.state.isValid) {
            this.form.submit()
            return
        }
        const body = { ...this.form.getModel() }
        const { schoolId } = this.props.match.params
        this.props.setIdentity(schoolId, body).then(res => {
            this.setState({ loading: false, identityVisible: false })
            const { reload } = this.state
            this.props.getIdentityDetail(reload)
            Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.identitySetSuccess' }))
        }).catch(error => {
            console.error(error)
            this.setState({ loading: false })
        })
    }
    handleOk = () => {
        this.setState({ visible: true })
    }
    handleCancel = () => {
        this.setState({ visible: false })
    }
    joinModalOpen = () => {
        this.setState({ joinVisible: true })
    }
    joinModalClose = () => {
        this.setState({ joinVisible: false })
    }
    identityModalOpen = () => {
        this.setState({ identityVisible: true })
    }
    setIdentity = () => {
        this.setState({ identityVisible: false })
    }
    getNextPage = (currentPage) => {
        this.setState({ reload: false, currentPage })
    }
    checkBoxOnChange = (v) => {
        this.setState({
            reload: true,
            currentPage: 1,
            showGraduation: v
        })
    }
    getList = (lists, schoolDetail) => {
        let content
        if (this.props.pending && this.state.currentPage === 1) {
            content = <Loading />
        } else {
            if (lists.length > 0) {
                content = []
                lists.map((v, i) => {
                    content.push(<div key={i}>
                        <Link to={classCourse.fill({ class: v._id, schoolId: this.props.match.params.schoolId })}>
                            <div className={styles.wp1}>
                                <div>
                                    <span>{v.nickname}</span>
                                    {v.status === 0 ? '' : <span className={styles.classStatus}>{this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.haveGraduation' })}</span>}
                                </div>
                            </div>
                            <div className={'rt'}>
                                <div><img src={classStu} /><span>{this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.student' })}：{deepGet(v, 'counter.member')}</span></div>
                                <div><img src={classCourseImg} /><span>{this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.course' })}：{deepGet(v, 'counter.course')}</span></div>
                            </div>
                        </Link>
                    </div>)
                })
            } else {
                content = <EmptyDataPlaceHolder />
            }
        }
        return content
    }

    constructor(props) {
        super(props)
        this.identityValidation = {
            validations: {
                lengthCheck: { min: 0, max: 7 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.mostAllow20' })
            }
        }
        this.nicknameValidation = {
            validations: {
                lengthCheck: { min: 0, max: 20 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.ClassList.mostAllow20' })
            }
        }
        props.registerAsyncDataLoader(this)
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentPage, reload, showGraduation } = this.state
        if (
            currentPage !== prevState.currentPage ||
            reload !== prevState.reload ||
            showGraduation !== prevState.showGraduation

        ) {
            this.props.reloadAsyncData()
        }
    }

    async componentWillLoadAsyncData() {
        const { showGraduation, currentPage, reload } = this.state
        const promises = [
            this.props.getApplyList(),
            this.props.getClass(currentPage, reload, { status: showGraduation ? 0 : undefined }),
            this.props.getIdentityDetail()
        ]
        await Promise.all(promises)
    }

    render() {
        const { list, applyTotal, total, pending, error, identityDetail, intl } = this.props
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }
        // TODO  404 catch的优化处理
        if (identityDetail.error === 404) {
            return <School404 />
        }

        return <div>
            <div className={styles.textPanel}>
                <Checkbox checked={this.state.showGraduation} onChange={this.checkBoxOnChange}>{intl.formatMessage({ id: 'intl.module.School.ClassList.notShowGraduation' })}</Checkbox>
                <div>
                    <Button size={'small'} onClick={this.handleOk}>{intl.formatMessage({ id: 'intl.module.School.ClassList.creatClass' })}</Button>
                    <Button size={'small'} counter={applyTotal} onClick={this.joinModalOpen}>{intl.formatMessage({ id: 'intl.module.School.ClassList.joinClassApply' })}</Button>
                    <Button size={'small'} onClick={this.identityModalOpen}>{intl.formatMessage({ id: 'intl.module.School.ClassList.identitySet' })}</Button>
                </div>
            </div>
            <ListInfo>
                {this.getList(list)}
                <div className={'pagination'}>
                    <Pagination defaultPageSize={PAGE_SIZE} onChange={this.onChange} current={this.state.currentPage}
                        total={total} />
                </div>
            </ListInfo>
            <Modal Button={<Button onClick={this.handleValidSubmit} size={'small'} type={'submit'}>{intl.formatMessage({ id: 'intl.module.School.ClassList.creatClass' })}</Button>
            } className={'schoolFeatureModal'} width={460} height={200} visible={this.state.visible}
                onCancel={this.handleCancel} title={intl.formatMessage({ id: 'intl.module.School.ClassList.newClass' })}>
                <Form className={'formInline'} ref={(form) => {
                    this.form = form
                }}>
                    <FormItem required {...this.nicknameValidation} name={'nickname'} title={intl.formatMessage({ id: 'intl.module.School.ClassList.inputClassName' })}>
                        <Input placeholder={intl.formatMessage({ id: 'intl.module.School.ClassList.inputClassName' })} />
                    </FormItem>
                </Form>
            </Modal>
            <Modal title={intl.formatMessage({ id: 'intl.module.School.ClassList.joinClassApply' })} width={620} height={550} visible={this.state.joinVisible}
                onCancel={this.joinModalClose}>

                <ClassApplyList />
            </Modal>
            <Modal Button={<Button size={'small'} onClick={this.saveIdentity} type={'submit'}>{intl.formatMessage({ id: 'intl.module.School.ClassList.update' })}</Button>}
                className={'schoolFeatureModal'} width={460} height={200} visible={this.state.identityVisible}
                title={intl.formatMessage({ id: 'intl.module.School.ClassList.identitySet' })} onCancel={this.setIdentity}>
                <Form className={'formInline'} ref={(form) => {
                    this.form = form
                }}>
                    <FormItem required {...this.identityValidation} name={'remark'} tips={intl.formatMessage({ id: 'intl.module.School.ClassList.remarkTips' })}
                        value={deepGet(identityDetail, 'data.remark')}>
                        <Input placeholder={intl.formatMessage({ id: 'intl.module.School.ClassList.inputNickname' })} />
                    </FormItem>
                </Form>
            </Modal>
        </div>
    }
}
