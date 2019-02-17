import React, { Component } from 'react'
import Action from '../../../redux/actions/School'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import { Button, Loading, Pagination } from '@microduino/micdesign'
import { Link, withRouter } from 'react-router-dom'
import { prepareCourse, classCourseDetail } from '$routes/School'
import styles from './courseIndex.less'
import releaseLesson from '../../../../static/images/school/release.png'
import ListCard from '$src/modules/School/components/ListCard'
import { deepGet } from '$utils'
import ErrorPage from '$components/ErrorPage'
import School404 from '$src/modules/School/components/School404'
import { injectIntl, intlShape } from 'react-intl'

let PAGE_SIZE = 4
const mapStateToProps = state => ({
    list: state.currentPageList.data,
    total: state.currentPageList.total,
    detail: state.currentDetail,
    schoolDetails: state.schoolDetail,
    classDetails: state.classDetail,
    error: state.currentPageList.error
})
const mapDispatchToProps = (dispatch, props) => {
    return {
        getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId)),
        getCourse: (currentPage = 1, reload = false, role = {}, options = {}) => {
            const params = {
                ...options,
                limit: PAGE_SIZE,
                skip: (currentPage - 1) * PAGE_SIZE
            }
            return dispatch(Action.classCourse(props.match.params.class, params, reload))
        }
    }
}
@injectIntl
@withRouter
@connect(
    mapStateToProps,
    mapDispatchToProps
)
@asyncDataLoader
export default class ClassCourse extends Component {
    static propTypes = {
        list: PropTypes.array,
        total: PropTypes.number,
        getCourse: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        reloadAsyncData: PropTypes.func,
        // getDetail: PropTypes.func,
        // detail: PropTypes.object,
        match: PropTypes.shape(),
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        error: PropTypes.bool,
        pending: PropTypes.bool,
        hiddenEndCourse: PropTypes.bool,
        intl: intlShape
    }
    state = { reload: true, visible: false, currentPage: 1 }
    getNextPage = (currentPage) => {
        this.setState({ reload: false, currentPage })
    }
    getList = (lists, schoolDetails, match) => {
        let content
        const classId = match.params.class
        const { schoolId } = match.params
        if (this.props.pending && this.state.currentPage === 1) {
            content = <Loading />
        } else {
            content = []
            if (deepGet(schoolDetails.data, 'currUser.isSchoolTeacher') === true) {
                content.push(<div key={'createBtn'} className={'creat'}>
                    <Link to={prepareCourse.fill({ classId: classId, schoolId })}>
                        <img src={releaseLesson} />
                        <p>{this.props.intl.formatMessage({ id: 'intl.module.School.Course.releaseCourse' })}</p>
                    </Link>
                </div>)
            }
            if (lists.length > 0) {
                lists.map((v, i) => {
                    content.push(<div key={i}><Link
                        to={classCourseDetail.fill({ schoolId, classId: classId, courseId: v.course._id })}>
                        <div className={styles.classInfo}><img src={deepGet(v, 'course.image')} />
                            <Button>{v.type === 1 ? this.props.intl.formatMessage({ id: 'intl.module.School.Course.onlineCourse' }) : this.props.intl.formatMessage({ id: 'intl.module.School.Course.offlineCourse' })}</Button></div>
                        <div className={'info'}><p>{deepGet(v, 'course.title')}</p>
                            <div><span>{deepGet(v, 'course.lessons.length')}{this.props.intl.formatMessage({ id: 'intl.module.School.Course.lesson' })} | {deepGet(v, 'course.meta.minAge')}{deepGet(v, 'course.meta.toplimit') ? this.props.intl.formatMessage({ id: 'intl.module.School.Course.above' }) : '-' + deepGet(v, 'course.meta.maxAge') + this.props.intl.formatMessage({ id: 'intl.module.School.Course.old' })}</span>
                                <div className={'mic-boutique-Button'}>{this.props.intl.formatMessage({ id: 'intl.module.School.Course.micBoutique' })}</div>
                            </div>
                        </div>
                    </Link></div>)
                })
            }
            // else {
            //     content.push('没有数据')
            // }
        }
        return content
    }
    onChange = (page) => {
        this.setState({
            currentPage: page
        })
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const { currentPage, reload } = this.state
        await this.props.getSchoolDetail()
        const isTeacher = deepGet(this.props.schoolDetails.data, 'currUser.isSchoolTeacher')
        const isStudent = deepGet(this.props.schoolDetails.data, 'currUser.isStudent')
        PAGE_SIZE = isTeacher ? 3 : 4
        const promises = [this.props.getCourse(currentPage, reload, { isTeacher },
            isStudent ? { hiddenEndCourse: this.props.hiddenEndCourse, type: 1, status: this.props.hiddenEndCourse ? 1 : undefined } : { status: this.props.hiddenEndCourse ? 1 : undefined })]
        await Promise.all(promises)
    }

    componentDidUpdate(prevProps, prevState) {
        const { extensions, type, title, label, orderBy, reload, currentPage } = this.state
        if (
            this.props.hiddenEndCourse !== prevProps.hiddenEndCourse ||
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
        const { list, total, match, schoolDetails, pending, error } = this.props
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }

        // TODO  404 catch的优化处理
        if (schoolDetails.error === 404) {
            return <School404 />
        }
        return <div className={styles.wp}>
            <ListCard>
                {this.getList(list, schoolDetails, match)}
            </ListCard>
            <div className={styles.pagination}>
                <Pagination defaultPageSize={PAGE_SIZE} onChange={this.onChange} current={this.state.currentPage}
                    total={total} />
            </div>
        </div>
    }
}
