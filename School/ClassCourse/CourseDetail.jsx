import React, { Component } from 'react'
import SchoolNav from '../components/SchoolNav'
import styles from './courseDetail.less'
import { Button, Confirm, Loading, Message } from '@microduino/micdesign'
import { Link } from 'react-router-dom'
import { addLesson, courseModify, classRoom } from '../../../routes/School'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import Action from '$redux/actions/School'
import School404 from '$src/modules/School/components/School404'
import ErrorPage from '$components/ErrorPage'
import { deepGet } from '$utils'
import moment from 'moment'
import CourseLessonList from './Components/CourseLessonList'
import Tabs from '$src/modules/School/components/TabComponent'
import ClassHomework from '$src/modules/School/Homework/ClassHomework'
import { goBack, push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape } from 'react-intl'

const mapStateToProps = state => ({
    pending: state.schoolDetail.pending && state.currentDetail.pending,
    error: state.schoolDetail.error && state.currentDetail.error,
    schoolDetails: state.schoolDetail,
    detail: state.currentDetail
})

const mapDispatchToProps = (dispatch, props) => {
    return {
        goBack: bindActionCreators(goBack, dispatch),
        push: url => {
            dispatch(push(url))
        },
        getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId)),
        getDetail: () => {
            return dispatch(Action.courseDetail(props.match.params.courseId))
        },
        delCourse: (id) => {
            return dispatch(Action.delCourse(props.match.params.courseId, id))
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
        delCourse: PropTypes.func,
        goBack: PropTypes.func,
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        push: PropTypes.func,
        intl: intlShape
    }
    handleDel = (id) => () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.CourseDetail.surePerform' }), () => {
            // const { school } = this.props.detail.data
            this.props.delCourse(id).then(() => {
                Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.CourseDetail.delSucess' }))
                this.props.push(classRoom.fill({ schoolId: this.props.match.params.schoolId }))
            }).catch(error => {
                console.error(error)
                Message.error(error.message)
            })
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.CourseDetail.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.CourseDetail.cancle' }) })
    }
    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }
    async componentWillLoadAsyncData() {
        const promises = [this.props.getDetail(), this.props.getSchoolDetail()]
        await Promise.all(promises)
    }
    render() {
        const { pending, error, detail, match, schoolDetails } = this.props
        const { data } = detail
        if (error) {
            return <ErrorPage />
        }
        if (pending) {
            return <Loading />
        }
        // TODO  404 catch的优化处理
        if (detail.error === 404 || schoolDetails.error === 404) {
            return <School404 />
        }
        const schoolNavProps = {
            schoolObj: { id: deepGet(schoolDetails, 'data._id'), name: deepGet(schoolDetails, 'data.name') },
            courseObj: { id: deepGet(detail, 'data._id'), name: deepGet(detail, 'data.title') }
        }
        const tabData = [this.props.intl.formatMessage({ id: 'intl.module.School.CourseDetail.lessonList' })]
        const NavWp = (
            <div className={styles.tab}>
                <Tabs cur={0} nav={tabData}>
                    {[
                        <div key={0}>
                            <div className={styles.wp2}>
                                {
                                    (() => {
                                        return data.isAuthor && <Link to={addLesson.fill({ course: this.props.match.params.courseId })}>
                                            <Button className={styles.button}>{this.props.intl.formatMessage({ id: 'intl.module.School.CourseDetail.createLesson' })}</Button>
                                        </Link>
                                    })()
                                }
                                <CourseLessonList courseId={this.props.match.params.courseId} />
                            </div>
                        </div>,
                        <div key={1}>
                            <ClassHomework />
                        </div>
                    ]}
                </Tabs>

            </div>
        )
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
        return <div className={styles.container}>
            <SchoolNav {...schoolNavProps} />
            <div className={styles.wp1}>
                <div>
                    <div className={styles.cover}><img src={data.image} /></div>
                    <div>
                        <div className={'mic-boutique-Button'}>{this.props.intl.formatMessage({ id: 'intl.module.School.Course.micBoutique' })}</div>
                        <div>
                            <span>{data.title}</span>
                            {(() => {
                                return data.isAuthor && <div><Link to={courseModify.fill({ courseId: match.params.courseId })}><div className={styles.edit} /></Link>
                                    <div className={styles.del} onClick={this.handleDel(match.params.courseId)} /></div>
                            })()}
                        </div>
                        <div>
                            <span>{deepGet(data, 'lessons.length')}{this.props.intl.formatMessage({ id: 'intl.module.School.Course.lesson' })} | {deepGet(data, 'author.username')} {this.props.intl.formatMessage({ id: 'intl.module.School.ClassCourseDetail.lastUpdate' })} {moment(data.updated_at).format('YYYY-MM-DD')}</span>
                        </div>
                        <div>
                            <span>
                                {deepGet(data, 'contents.substance')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {NavWp}

        </div>
    }
}
