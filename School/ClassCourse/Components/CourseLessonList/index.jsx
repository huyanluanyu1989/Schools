import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Message, Switch, Confirm, Loading, Button } from '@microduino/micdesign'
import { connect } from 'react-redux'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import Action from '$redux/actions/Lesson'
import SchoolAction from '$redux/actions/School'
import styles from './index.less'
import ErrorPage from '$components/ErrorPage'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { deepGet } from '$utils'
import { withRouter } from 'react-router-dom'
import { updateLesson, courseLessonDetail, classCourseLessonDetail } from '$routes/School'
import { injectIntl, intlShape } from 'react-intl'
import School404 from '$src/modules/School/components/School404'

const mapStateToProps = state => ({
    schoolDetails: state.schoolDetail,
    list: state.lessonList.data,
    pending: state.lessonList.pending,
    error: state.lessonList.error
})

const mapDispatchToProps = (dispatch, props) => {
    return {
        getSchoolDetail: () => {
            return dispatch(SchoolAction.detail(props.match.params.schoolId))
        },
        getList: () => {
            return dispatch(Action.courseLessonList(props.courseId, { school: props.match.params.schoolId, class: props.match.params.classId }))
        },
        switchStatus: (lesson, status) => {
            return dispatch(Action.switchStatus(props.match.params.classId, props.match.params.courseId, lesson, status))
        },
        remove: (id) => {
            return dispatch(Action.remove(props.courseId, id))
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
export default class CourseLessonList extends Component {
    static propTypes = {
        match: PropTypes.shape(),
        switchStatus: PropTypes.func,
        mode: PropTypes.oneOf(['switch', 'edit', 'student']),
        courseId: PropTypes.string.isRequired,
        push: PropTypes.func,
        remove: PropTypes.func,
        list: PropTypes.array,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        getList: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        intl: intlShape
    }
    static defaultProps = {
        mode: 'edit',
        default: ''
    }
    state = { typeDes: '' }
    handleEdit = (lessonId) => (e) => {
        e.stopPropagation()
        this.props.push(updateLesson.fill({ course: this.props.courseId, lessonId }))
    }
    handleDel = (id) => (e) => {
        e.stopPropagation()
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.delInfo' }), () => {
            this.props.remove(id).then(() => {
                Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.delSucess' }))
            }).catch(error => {
                console.error(error)
                Message.error(this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.networkBusy' }))
            })
        }, { sure: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.sure' }), cancel: this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.cancle' }) })
    }
    switchClick = (e) => {
        e.stopPropagation()
    }
    onSwitchChange = (lesson) => (e, v) => {
        e.stopPropagation()
        const open = this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.lessonOpen' })
        const close = this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.lessonClose' })
        this.props.switchStatus(lesson, v ? 0 : 2).then(() => {
            this.setState({
                typeDes: v ? open : close
            })
            Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.operationSucess' }))
        })
    }
    handlePush = (url, type) => (e) => {
        const { isSchoolTeacher } = this.props.schoolDetails.data.currUser
        if (type !== 0 && !isSchoolTeacher) {
            Message.warn(this.props.intl.formatMessage({ id: 'intl.module.School.Lesson.notOpen' }))
            return
        }
        e.stopPropagation()
        this.props.push(url)
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }
    async componentWillLoadAsyncData() {
        const promises = [this.props.getSchoolDetail(), this.props.getList()]
        await Promise.all(promises)
    }

    render() {
        const { pending, mode, error, list, intl, schoolDetails } = this.props

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
        return (
            <div className={styles.list}>
                {list.map((v, i) => <ul onClick={this.handlePush(
                    this.props.match.params.classId
                        ? classCourseLessonDetail.fill(
                            {
                                classId: this.props.match.params.classId,
                                schoolId: this.props.match.params.schoolId,
                                courseId: this.props.courseId,
                                lessonId: v._id
                            }
                        )
                        : courseLessonDetail.fill(
                            {
                                schoolId: this.props.match.params.schoolId,
                                courseId: this.props.courseId,
                                lessonId: v._id
                            }
                        ), v.type)} key={i}>
                    <li>{i + 1}</li>
                    <li>{deepGet(v, 'title')}</li>
                    <li>
                        {((mode) => {
                            switch (mode) {
                                case 'edit':
                                    return v.isAuthor && <Fragment>
                                        <Button onClick={this.handleEdit(deepGet(v, '_id'))}
                                            className={'edit'}>{intl.formatMessage({ id: 'intl.module.School.Lesson.edit' })}
                                        </Button>
                                        <Button onClick={this.handleDel(deepGet(v, '_id'))}
                                            className={'del'}>{intl.formatMessage({ id: 'intl.module.School.Lesson.delete' })}
                                        </Button>
                                    </Fragment>
                                case 'switch':
                                    return <div title={!this.state.typeDes ? (v.type !== 0
                                        ? intl.formatMessage({ id: 'intl.module.School.Lesson.lessonClose' })
                                        : intl.formatMessage({ id: 'intl.module.School.Lesson.lessonOpen' }))
                                        : this.state.typeDes}>
                                        <Switch checked={v.type === 0} onClick={this.switchClick}
                                            onChange={this.onSwitchChange(v._id)} />
                                    </div>
                                case 'student':
                                    return v.type !== 0
                                        ? intl.formatMessage({ id: 'intl.module.School.Lesson.notClasses' })
                                        : intl.formatMessage({ id: 'intl.module.School.Lesson.classes' })
                            }
                        })(mode)}

                    </li>
                </ul>)}

            </div>
        )
    }
}
