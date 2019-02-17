import React, { Component } from 'react'
import styles from './prepareCourse.less'
import { Checkbox, Confirm, Button, Form, FormItem, Loading, Pagination, Radio, Modal, Search, Message } from '@microduino/micdesign'
import creatLesson from '../../../../static/images/school/creatLesson.png'
import { Link, withRouter } from 'react-router-dom'
import { addCourse, courseDetail, classCourseDetail } from '../../../routes/School'
import Action from '../../../redux/actions/School'
import PropTypes, { func } from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import ListCard from '$src/modules/School/components/ListCard'
import classNames from 'classnames/bind'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router'
import { deepGet } from '$utils'
import SchoolNav from '$src/modules/School/components/SchoolNav'
import ErrorPage from '$components/ErrorPage'
import School404 from '$src/modules/School/components/School404'
import { injectIntl, intlShape } from 'react-intl'
const classBind = classNames.bind(styles)
let PAGE_SIZE = 4
const mapStateToProps = state => ({
    list: state.currentPageList.data,
    total: state.currentPageList.total,
    schoolDetails: state.schoolDetail,
    classDetails: state.classDetail
})

const mapDispatchToProps = (dispatch, props) => ({
    getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId)),
    getClassDetail: () => {
        return dispatch(Action.classDetail(props.match.params.classId))
    },
    getCourse: (currentPage = 1, reload = false, status = false, options = {}) => {
        const classId = props.match.params.classId
        const school = props.match.params.schoolId
        PAGE_SIZE = classId ? PAGE_SIZE : 3
        const params = {
            ...options,
            class: classId,
            school,
            status,
            limit: PAGE_SIZE,
            skip: (currentPage - 1) * PAGE_SIZE
        }
        return dispatch(Action.prepareCourse(params, reload))
    },
    releaseCourse: (classId, courseId, body) => dispatch(Action.releaseCourse(classId, courseId, body)),
    push: bindActionCreators(push, dispatch)
})
@injectIntl
@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class PrepareCourse extends Component {
    static propTypes = {
        pending: PropTypes.bool,
        error: PropTypes.bool,
        list: PropTypes.array,
        total: PropTypes.number,
        getCourse: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        reloadAsyncData: PropTypes.func,
        match: PropTypes.shape(),
        releaseCourse: PropTypes.func,
        push: func,
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        classDetails: PropTypes.object,
        getClassDetail: PropTypes.func,
        intl: intlShape,
        hiddenReleaseCourse: PropTypes.bool
    }
    state = { reload: true, visible: false, currentPage: 1, courseId: '', hiddenReleaseCourse: true, pageSize: PAGE_SIZE }
    onChange = (page) => {
        this.setState({
            currentPage: page
        })
    }
    releaseCourse = () => {
        const { classId } = this.props.match.params
        const body = { ...this.form.getModel() }
        this.props.releaseCourse(classId, this.state.courseId, body).then(res => {
            this.setState({ loading: false, visible: false })
            // const { currentPage, reload } = this.state
            // this.props.releaseCourse(currentPage, reload)
            this.props.push(classCourseDetail.fill({ schoolId: this.props.match.params.schoolId, classId: this.props.match.params.classId, courseId: this.state.courseId }))
        }).catch(error => {
            console.error(error)
            this.setState({ loading: false })
        })
    }
    // handlePush=(url) => (e) => {
    //     e.stopPropagation()
    //     this.props.push(url)
    // }
    handleOk = (courseId, status) => (e, ee, eee) => {
        e.stopPropagation()
        e.preventDefault()
        if (status === 0) {
            this.setState({ visible: true, courseId: courseId })
        } else {
            Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.sureCancle' }), () => {
                this.setState({ courseId: courseId })
            }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.cancel' }) })
        }
    }
    handleCancel = () => {
        this.setState({ visible: false })
    }
    handlePush = (v, i) => () => {
        if (!this.props.match.params.classId) {
            this.props.push(courseDetail.fill({ schoolId: this.props.match.params.schoolId, courseId: v._id }))
        } else {
            if (v.status === 1) {
                Message.warn(this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.notRepeat' }))
            }
            return false
        }
    }
    handleTitleSearch = (e, v) => {
        this.setState({ title: v, currentPage: 1, reload: true })
    }
    getList = (lists, id) => {
        let content
        if (this.props.pending && this.state.currentPage === 1) {
            content = <Loading />
        } else {
            if (lists.length > 0) {
                content = []
                let wrapperClassName
                if (!id) {
                    wrapperClassName = classBind(
                        'mask',
                        'hide'
                    )
                } else {
                    wrapperClassName = classBind(
                        'mask'
                    )
                }
                lists.map((v, i) => {
                    // TODO 需要给button添加事件冒泡
                    // to={courseDetail.fill({ courseId: v._id })}
                    content.push(<div key={i}><div onClick={this.handlePush(v, i)}>
                        <div className={'imageBg'}>
                            <img src={v.image} />
                            <div className={wrapperClassName}>
                                {v.status === 0 ? <Button className={'release'} onClick={this.handleOk(v._id, v.status)}
                                    size={'small'}>{this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.release' })}</Button>
                                    : <Button className={'released'}
                                        size={'small'}>{this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.released' })}</Button>}
                            </div>
                        </div>
                        <div className={'info'}>
                            <p>{v.title}</p>
                            <div>
                                <span>{v.lessons ? v.lessons.length : 0}{this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.lesson' })} | {deepGet(v, 'meta.minAge')}{deepGet(v, 'meta.toplimit') ? this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.oldAbove' }) : '-' + deepGet(v, 'meta.maxAge') + this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.old' })}</span>
                                <div className={'mic-boutique-Button'}>{this.props.intl.formatMessage({ id: 'intl.module.School.Course.micBoutique' })}</div>
                            </div>
                            <div>
                                <img src={deepGet(v, 'author.avatar')} />
                                <span>{deepGet(v, 'author.username')}</span>
                            </div>
                        </div>
                    </div>
                    </div>)
                })
            }
        }
        return content
    }
    getCreat = (id) => {
        let content = []
        if (!id) {
            content.push(<div className={'creat'} key={0}>
                <Link to={addCourse.fill({ schoolId: this.props.match.params.schoolId })}>
                    <img src={creatLesson} />
                    <p>{this.props.intl.formatMessage({ id: 'intl.module.School.PrepareCourse.createNewCourse' })}</p>
                </Link>
            </div>)
        } else {
            content = []
        }

        return content
    }
    handleCheckboxChange = (v) => {
        this.setState({
            reload: true,
            currentPage: 1,
            hiddenReleaseCourse: v
        })
    }
    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const { title, currentPage, reload } = this.state
        const { classId } = this.props.match.params
        PAGE_SIZE = classId && 4
        let status = classId && this.state.hiddenReleaseCourse
        const promises = [this.props.getCourse(currentPage, reload, status, { title }), classId && this.props.getClassDetail(), this.props.getSchoolDetail()]
        await Promise.all(promises)
    }

    componentDidUpdate(prevProps, prevState) {
        const { extensions, type, title, label, orderBy, reload, currentPage, hiddenReleaseCourse } = this.state
        if (
            hiddenReleaseCourse !== prevState.hiddenReleaseCourse ||
            extensions !== prevState.extensions ||
            type !== prevState.type ||
            orderBy !== prevState.orderBy ||
            label !== prevState.label ||
            title !== prevState.title ||
            reload !== prevState.reload ||
            currentPage !== prevState.currentPage

        ) {
            this.props.reloadAsyncData()
        }
    }

    render() {
        // const navData = ['麦堆学院之美科云校园', this.props.match.params.nickname, '发布课程']
        const { list, total, match, schoolDetails, classDetails, pending, error, intl } = this.props
        const radioData = [{ val: '1', title: intl.formatMessage({ id: 'intl.module.School.PrepareCourse.onlineCourse' }) }, { val: '2', title: intl.formatMessage({ id: 'intl.module.School.PrepareCourse.offlineCourse' }) }]
        const schoolNavProps = {
            schoolObj: { id: deepGet(schoolDetails, 'data._id'), name: deepGet(schoolDetails, 'data.name') },
            classObj: { id: deepGet(classDetails, 'data._id'), name: deepGet(classDetails, 'data.nickname') },
            courseObj: { id: 'courseId', name: intl.formatMessage({ id: 'intl.module.School.PrepareCourse.releaseCourse' }) }
        }
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }
        // TODO  404 catch
        if (schoolDetails.error === 404 || classDetails.error === 404) {
            return <School404 />
        }
        return <div>
            {match.params.classId ? <SchoolNav {...schoolNavProps} /> : ''}
            <div className={styles.textPanel}>
                <div>
                    <div>
                        {match.params.classId && <Checkbox onChange={this.handleCheckboxChange} checked={this.state.hiddenReleaseCourse} >{intl.formatMessage({ id: 'intl.module.School.PrepareCourse.notShowReleased' })}</Checkbox>}
                    </div>
                    <div className={styles.search}>
                        <Search value={this.state.title} onClick={this.handleTitleSearch} placeholder={intl.formatMessage({ id: 'intl.module.School.PrepareCourse.searchCourseName' })} />
                    </div>
                </div>
            </div>
            <div className={'container'}>
                <ListCard>
                    {this.getCreat(match.params.classId)}
                    {this.getList(list, match.params.classId)}
                </ListCard>
                <Pagination defaultPageSize={PAGE_SIZE} onChange={this.onChange} current={this.state.currentPage}
                    total={total} />
            </div>
            <Modal Button={<Button onClick={this.releaseCourse}>{intl.formatMessage({ id: 'intl.module.School.PrepareCourse.sureRealease' })}</Button>} width={440} height={200} title={intl.formatMessage({ id: 'intl.module.School.PrepareCourse.courseRealease' })} onCancel={this.handleCancel} visible={this.state.visible}>
                <Form ref={(form) => {
                    this.form = form
                }}>
                    <FormItem value={1} title={intl.formatMessage({ id: 'intl.module.School.PrepareCourse.choseReleaseWay' })} name={'type'}>
                        <Radio data={radioData} />
                    </FormItem>

                </Form>
            </Modal>
        </div>
    }
}
