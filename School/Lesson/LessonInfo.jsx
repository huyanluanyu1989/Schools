import React, { Component } from 'react'
import { push } from 'connected-react-router'
import LessonAction from '$redux/actions/Lesson'
import { connect } from 'react-redux'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import PropTypes from 'prop-types'
import ErrorPage from '$components/ErrorPage'
import { Loading } from '@microduino/micdesign'
import styles from './lessonInfo.less'
import SchoolNav from '$src/modules/School/components/SchoolNav'
import { deepGet } from '$utils'
import Action from '$redux/actions/School'
import IntlEditor from '$components/IntlEditor'
import HardwareCard from '$src/modules/Asset/components/HardwareCard'
import { injectIntl, intlShape } from 'react-intl'

const mapStateToProps = state => {
    return {
        schoolDetails: state.schoolDetail,
        classDetails: state.classDetail,
        detail: state.currentDetail,
        error: state.currentDetail.error
    }
}

const mapDispatchToProps = (dispatch, props) => ({
    push: url => dispatch(push(url)),
    getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId)),
    getClassDetail: () => dispatch(Action.classDetail(props.match.params.classId)),
    getDetail: () => dispatch(LessonAction.detail(props.match.params.lessonId))
})
@injectIntl
@connect(
    mapStateToProps,
    mapDispatchToProps
)
@asyncDataLoader
export default class LessonInfo extends Component {
    static propTypes = {
        match: PropTypes.shape(),
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        classDetails: PropTypes.object,
        getClassDetail: PropTypes.func,
        getDetail: PropTypes.func,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        detail: PropTypes.object,
        registerAsyncDataLoader: PropTypes.func,
        intl: intlShape
    }
    static defaultProps = {
        default: ''
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const promises = [this.props.getSchoolDetail(), this.props.getDetail()]

        if (this.props.match.params.classId) {
            promises.push(this.props.getClassDetail())
        }
        await Promise.all(promises)
    }
    componentDidMount() {
        // this.office.addEventListener('load', function () {
        //     alert('Local iframe is now loaded.')
        // })
    }
    render() {
        const { pending, error, detail, schoolDetails, classDetails, intl } = this.props
        if (error) {
            return <ErrorPage />
        }

        if (pending) {
            return <Loading />
        }
        const schoolNavProps = {
            schoolObj: { id: deepGet(schoolDetails, 'data._id'), name: deepGet(schoolDetails, 'data.name') },
            classObj: { id: deepGet(classDetails, 'data._id'), name: deepGet(classDetails, 'data.nickname') },
            courseObj: { id: deepGet(detail, 'data._id'), name: deepGet(detail, 'data.title') }
        }
        if (!this.props.match.params.classId) {
            delete schoolNavProps['classObj']
        }
        return (
            <div className={styles.lessonInfo}>

                <div className={styles.topWp}>
                    <div className={styles.wp}>
                        <SchoolNav {...schoolNavProps} />
                        <div className={`${styles.topMemo} clearFix`}>
                            <div className={styles.leftWp}>
                                <p>{detail.data.title}</p>
                                {(() => {
                                    const zip = deepGet(detail, 'data.contents.attachment.url')
                                    return zip && <a download href={zip} className={`${styles.zip} text-overflow-1`}>
                                        {deepGet(detail, 'data.contents.attachment.filename')}
                                    </a>
                                })()}

                            </div>
                            <div className={styles.rightWp}>
                                <div className={`${styles.moduleWp} clearFix`}>
                                    {detail.data.modules && detail.data.modules.length > 0 ? detail.data.modules.map((v, i) => {
                                        return <HardwareCard className={styles.moduleCard} key={i} data={v} />
                                    }) : <div
                                            className={'noData'}>{intl.formatMessage({ id: 'intl.module.School.LessonInfo.notModule' })}</div>}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className={styles.bottomWp}>
                    <div className={styles.wp}>
                        <p className={styles.title}>{intl.formatMessage({ id: 'intl.module.School.LessonInfo.lessonCourseware' })}</p>
                        <div className={styles.content}>
                            {(() => {
                                switch (deepGet(detail, 'data.meta.type', '').toString()) {
                                    case '1':
                                        return <iframe
                                            ref={(office) => {
                                                window.office = office
                                            }}
                                            src={`https://view.officeapps.live.com/op/view.aspx?src=https:${deepGet(detail, 'data.contents.courseware.url')}`}
                                            width='100%' height='600' />
                                    case '2':
                                        return <div className={styles.videoWp}
                                            dangerouslySetInnerHTML={{ __html: deepGet(detail, 'data.contents.video', '') }} />
                                    case '3':
                                        return <IntlEditor readOnly tools={['image', 'latex', 'code', 'iframe', 'link']}
                                            getValue={() => deepGet(detail, 'data.contents.substance', '')} />
                                }
                            })()}
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}
