import React, { Component } from 'react'
import styles from './courseDetail.less'
import { Button, Confirm, Loading, Message } from '@microduino/micdesign'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import Action from '$redux/actions/School'
import School404 from '$src/modules/School/components/School404'
import ErrorPage from '$components/ErrorPage'
import { deepGet } from '$utils'
import moment from 'moment'
import CourseLessonList from './Components/CourseLessonList'
import { goBack, push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import Tabs from '$src/modules/School/components/TabComponent'
import ClassHomework from '$src/modules/School/Homework/ClassHomework'
import { classCourse } from '$routes/School'
import SchoolNav from '$src/modules/School/components/SchoolNav'
import { injectIntl, intlShape } from 'react-intl'
const mapStateToProps = state => ({
    detail: state.currentDetail,
    schoolDetails: state.schoolDetail,
    classDetails: state.classDetail,
    pending: state.lessonList.pending,
    error: state.lessonList.error
})

const mapDispatchToProps = (dispatch, props) => {
    return {
        goBack: bindActionCreators(goBack, dispatch),
        getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId)),
        statusModify: (body) => dispatch(Action.courseStatusModify(props.match.params.classId, body, props.match.params.courseId)),
        getDetail: () => {
            const params = {
                class: props.match.params.classId
            }
            return dispatch(Action.courseDetail(props.match.params.courseId, params))
        },
        getClassDetail: () => {
            return dispatch(Action.classDetail(props.match.params.classId))
        },
        delClassCourse: () => {
            return dispatch(Action.delClassCourse(props.match.params.classId, props.match.params.courseId))
        },
        push: url => {
            dispatch(push(url))
        }
    }
}
@injectIntl
@connect(
    mapStateToProps,
    mapDispatchToProps
)
@asyncDataLoader
export default class CourseInfo extends Component {
    static propTypes = {
        getDetail: PropTypes.func,
        detail: PropTypes.object,
        registerAsyncDataLoader: PropTypes.func,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        match: PropTypes.shape(),
        delClassCourse: PropTypes.func,
        statusModify: PropTypes.func,
        push: PropTypes.func,
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        classDetails: PropTypes.object,
        getClassDetail: PropTypes.func,
        reloadAsyncData: PropTypes.func,
        intl: intlShape
    }
    state = { reload: true, visible: false, status: 1, type: 1 }
    handleDel = () => () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.isCancle' }), () => {
            this.props.delClassCourse().then(() => {
                Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.cancleSucess' }))
                this.props.push(classCourse.fill({ schoolId: this.props.match.params.schoolId, class: this.props.match.params.classId }))
            }).catch(error => {
                console.error(error)
                Message.error(error.message)
            })
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.cancle' }) })
    }
    handleModify = (status, type, msg) => () => {
        Confirm.confirm(msg, () => {
            const body = {
                status,
                type
            }
            this.props.statusModify(body).then(() => {
                Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.operationSucess' }))
                this.setState({
                    status,
                    type
                })
            }).catch(error => {
                console.error(error)
                Message.error(error.message)
            })
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.cancle' }) })
    }
    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }
    async componentWillLoadAsyncData() {
        const promises = [this.props.getDetail(), this.props.getClassDetail(), this.props.getSchoolDetail()]
        await Promise.all(promises)
    }
    async componentDidLoadAsyncData(setState) {
        setState({
            type: this.props.detail.data.type,
            status: this.props.detail.data.status
        })
    }
    render() {
        const { pending, error, detail, match, schoolDetails, classDetails, intl } = this.props
        const { status, type } = this.state
        const { data } = detail

        if (error) {
            return <ErrorPage />
        }
        if (pending) {
            return <Loading />
        }
        // TODO  404 catch的优化处理
        if (detail.error === 404 || schoolDetails.error === 404 || classDetails.error === 404) {
            return <School404 />
        }
        const isTeacher = deepGet(schoolDetails, 'data.currUser.isSchoolTeacher')
        const tabData = [intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.lessonList' })]
        const NavWp = (
            <div className={styles.tab}>
                <Tabs cur={0} nav={tabData}>
                    {[
                        <div key={0}>
                            <div className={styles.wp2}>
                                <CourseLessonList mode={isTeacher ? 'switch' : 'student'} courseId={match.params.courseId} />
                            </div>
                        </div>,
                        <div key={1}>
                            <ClassHomework />
                        </div>
                    ]}
                </Tabs>

            </div>
        )
        const schoolNavProps = {
            schoolObj: { id: deepGet(schoolDetails, 'data._id'), name: deepGet(schoolDetails, 'data.name') },
            classObj: { id: deepGet(classDetails, 'data._id'), name: deepGet(classDetails, 'data.nickname') },
            courseObj: { id: deepGet(detail, 'data._id'), name: deepGet(detail, 'data.title') }
        }
        return <div className={styles.container}>
            <SchoolNav {...schoolNavProps} />
            <div className={styles.wp1}>
                <div>
                    <div className={styles.cover}><img src={data.image} /></div>
                    <div>
                        <div className={'mic-boutique-Button'}>
                            {intl.formatMessage({ id: 'intl.module.School.Course.micBoutique' })}
                        </div>
                        <div className={styles.title}>
                            <span>{data.title}</span>
                            <div title={intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.switch' })}>
                                {isTeacher &&
                                    <Button onClick={this.handleModify(status, type === 2 ? 1 : 2, type === 1
                                        ? intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.switchOfflineInfo' })
                                        : intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.switchOnlineInfo' }))}>
                                        {type === 2 ? intl.formatMessage({ id: 'intl.module.School.Course.offlineCourse' })
                                            : intl.formatMessage({ id: 'intl.module.School.Course.onlineCourse' })}
                                    </Button>}
                            </div>
                        </div>
                        <div>
                            <span>{deepGet(data, 'lessons.length')}
                                {intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.lesson' })}
                                | {deepGet(data, 'author.username')}
                                {intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.lastUpdate' })}
                                {moment(data.updated_at).format('YYYY-MM-DD')}
                            </span>
                        </div>
                        <div>
                            <span>
                                {deepGet(data, 'contents.substance')}
                            </span>
                        </div>
                        {isTeacher && <div>
                            <Button size={'small'} onClick={this.handleModify(status === 1 ? 2 : 1, type, status === 1
                                ? intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.closeCourseInfo' })
                                : intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.openCourseInfo' }))}>
                                {status === 1 ? intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.closeCourse' })
                                    : intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.openCourse' })}
                            </Button>
                            <Button size={'small'} onClick={this.handleDel()}>
                                {intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.cancleRelease' })}
                            </Button>
                        </div>}
                    </div>
                </div>
            </div>
            {isTeacher && <div className={styles.wp3}>
                <div>
                    {type === 1
                        ? intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.studentOnlyBrowseOpenedLesson' })
                        : intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.lessonOpenRecordProgress' })}
                </div>
            </div>
            }

            {NavWp}

        </div>
    }
}
