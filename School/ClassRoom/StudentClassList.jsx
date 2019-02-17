import React, { Component } from 'react'
import styles from './classList.less'
import { Checkbox, Button, Pagination, Loading } from '@microduino/micdesign'
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
import { injectIntl, intlShape } from 'react-intl'
const PAGE_SIZE = 12
const mapStateToProps = state => ({
    list: state.currentPageList.data,
    total: state.currentPageList.total
})

const mapDispatchToProps = (dispatch, props) => ({
    saveClass: (school, body, id) => dispatch(Action.save(school, body, id)),
    setIdentity: (school, body, id) => dispatch(Action.setIdentity(school, body, id)),
    // getIdentityDetail: () => dispatch(Action.identityDetail(props.match.params.schoolId)),
    getClass: (currentPage = 1, reload = false, options = {}) => {
        const params = {
            ...options,
            limit: PAGE_SIZE,
            skip: (currentPage - 1) * PAGE_SIZE
        }
        return dispatch(Action.studentClassList(props.match.params.schoolId, params, reload))
    },
    push: bindActionCreators(push, dispatch)
})
@injectIntl
@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class ClassList extends Component {
    static propTypes = {
        pending: PropTypes.bool,
        list: PropTypes.array,
        total: PropTypes.number,
        getClass: PropTypes.func,
        saveClass: PropTypes.func,
        setIdentity: PropTypes.func,
        // getIdentityDetail: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        match: PropTypes.shape(),
        error: PropTypes.bool,
        reloadAsyncData: PropTypes.func,
        intl: intlShape
        // identityDetail: PropTypes.object
        // push: func
        // reloadAsyncData: PropTypes.func
    }
    state = {
        reload: true,
        visible: false,
        currentPage: 1,
        joinVisible: false,
        identityVisible: false,
        showGraduation: false }
    onChange = (page) => {
        this.setState({
            currentPage: page
        }, () => {
            const { currentPage, showGraduation, reload } = this.state
            this.props.getClass(currentPage, reload, { status: showGraduation ? 1 : 0 })
        })
    }
    handleValidSubmit = () => {
        const body = { ...this.form.getModel() }
        const { schoolId } = this.props.match.params
        this.props.saveClass(schoolId, body).then(res => {
            this.setState({ loading: false, visible: false })
            const { currentPage, reload } = this.state
            this.props.getClass(currentPage, reload)
        }).catch(error => {
            console.error(error)
            this.setState({ loading: false })
        })
    }
    saveIdentity = () => {
        const body = { ...this.form.getModel() }
        const { schoolId } = this.props.match.params
        this.props.setIdentity(schoolId, body).then(res => {
            this.setState({ loading: false, visible: false })
            const { currentPage, reload } = this.state
            this.props.getClass(currentPage, reload)
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
    identityModalClose = () => {
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
                            <div className={'lf'}>
                                <div>
                                    <span>{v.nickname}</span>
                                    {v.status === 0 ? '' : <span className={styles.classStatus}>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.haveGraduation' })}</span>}
                                </div>
                                <span>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.teacherCharge' })}：{deepGet(v, 'author.username')}</span>
                            </div>
                            <div className={'rt'}>
                                <div><img src={classStu} /><span>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.student' })}：{deepGet(v, 'counter.member')}</span></div>
                                <div><img src={classCourseImg} /><span>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.course' })}：{deepGet(v, 'counter.course')}</span></div>
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
    getActionBtn = (schoolDetail) => {
        let content = []
        if(!deepGet(schoolDetail.data, 'currUser.isSchoolTeacher')) {
            return ''
        }
        content.push(<div key={0}>
            <Button size={'small'} onClick={this.handleOk}>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.creatClass' })}</Button>
            <Button size={'small'} onClick={this.joinModalOpen}>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.joinClassApply' })}</Button>
            <Button size={'small'} onClick={this.identityModalOpen}>{this.props.intl.formatMessage({ id: 'intl.module.School.StudentClassList.identitySet' })}</Button>
        </div>)
        return content
    }
    constructor(props) {
        super(props)
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
        const { currentPage, reload, showGraduation } = this.state
        const promises = [this.props.getClass(currentPage, reload, { status: showGraduation ? 0 : undefined })]
        await Promise.all(promises)
    }
    render() {
        const { list, total, pending, error, intl } = this.props
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }
        return <div>
            <div className={styles.textPanel}>
                <div>
                    <Checkbox text={intl.formatMessage({ id: 'intl.module.School.StudentClassList.notShowGraduation' })} checked={this.state.showGraduation} onChange={this.checkBoxOnChange}>{ intl.formatMessage({ id: 'intl.module.School.StudentClassList.notShowGraduation' })}</Checkbox>
                </div>
            </div>
            <ListInfo>
                {this.getList(list)}
                <div className={'pagination'}>
                    <Pagination defaultPageSize={PAGE_SIZE} onChange={this.onChange} current={this.state.currentPage} total={total} />
                </div>
            </ListInfo>
        </div>
    }
}
