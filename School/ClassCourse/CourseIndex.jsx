import React, { Component } from 'react'
import styles from './courseIndex.less'
import Tabs from '../components/TabComponent'
import SchoolNav from '../components/SchoolNav'
import ClassCourse from './ClassCourse'
import ClassDetail from '../ClassRoom/ClassDetail'
import PropTypes from 'prop-types'
import TabsRight from '../components/TabsRight'
import { Button, Confirm, Checkbox, Loading, Message } from '@microduino/micdesign'
import Action from '../../../redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import { deepGet } from '$utils'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import ErrorPage from '$components/ErrorPage'
import School404 from '$src/modules/School/components/School404'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { classRoom } from '../../../routes/School'
import { injectIntl, intlShape } from 'react-intl'

const mapStateToProps = state => ({
    classDetails: state.classDetail,
    schoolDetails: state.schoolDetail
})

const mapDispatchToProps = (dispatch, props) => ({
    classExit: (id) => dispatch(Action.classExit(id)),
    getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId)),
    getClassDetail: () => {
        return dispatch(Action.classDetail(props.match.params.class))
    },
    push: bindActionCreators(push, dispatch)
})
@injectIntl
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class ListCard extends Component {
    static propTypes = {
        match: PropTypes.shape(),
        classExit: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        getSchoolDetail: PropTypes.func,
        schoolDetails: PropTypes.object,
        classDetails: PropTypes.object,
        getClassDetail: PropTypes.func,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        push: PropTypes.func,
        intl: intlShape
    }
    state = { hiddenEndCourse: true, reload: true, data: [] }
    classExit = (classId) => () => {
        Confirm.confirm(this.props.intl.formatMessage({ id: 'intl.module.School.CourseIndex.surePerform' }),
            () => {
                this.props.classExit(classId).then(() => {
                    Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.CourseIndex.exitClassSucess' }))
                    this.props.push(classRoom.fill({ schoolId: this.props.match.params.schoolId }))
                }).catch(error => {
                    console.error(error)
                    Message.error(error.message)
                })
            })
    }
    handleCheckboxChange = (v) => {
        this.setState({ hiddenEndCourse: v })
    }
    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const promises = [this.props.getClassDetail(), this.props.getSchoolDetail()]
        await Promise.all(promises)
    }
    render() {
        const { classDetails, schoolDetails, pending, error, intl } = this.props

        if (error) {
            return <ErrorPage />
        }
        if (pending) {
            return <Loading />
        }
        // TODO  404 catch的优化处理
        if (schoolDetails.error === 404 || classDetails.error === 404) {
            return <School404 />
        }
        let tabChild
        const CheckView = <Checkbox onChange={this.handleCheckboxChange} checked={this.state.hiddenEndCourse} >
            {intl.formatMessage({ id: 'intl.module.School.CourseIndex.notShowEndCourse' })}
        </Checkbox>
        if (deepGet(schoolDetails.data, 'currUser.isSchoolTeacher') === true) {
            tabChild = <ClassDetail><div>{CheckView}</div></ClassDetail>
        } else if (deepGet(schoolDetails.data, 'currUser.isStudent') === true) {
            tabChild = <div>{CheckView}
                <span>
                    {intl.formatMessage({ id: 'intl.module.School.CourseIndex.classTeacher' })}：{deepGet(classDetails, 'data.author.username')}
                </span>
            </div>
        }

        const tabData = [intl.formatMessage({ id: 'intl.module.School.CourseIndex.classCourse' }), '']
        const NavWp = (
            <div className={styles.tab}>
                {tabChild}
                <Tabs cur={0} nav={tabData}>
                    {[
                        <div key={0}>
                            <ClassCourse hiddenEndCourse={this.state.hiddenEndCourse} />
                        </div>,
                        <div key={1} />
                    ]}
                </Tabs>

            </div >
        )
        const schoolNavProps = {
            schoolObj: { id: deepGet(schoolDetails, 'data._id'), name: deepGet(schoolDetails, 'data.name') },
            classObj: { id: deepGet(classDetails, 'data._id'), name: deepGet(classDetails, 'data.nickname') }
        }
        return <div>
            <div className={styles.navWp}>
                <SchoolNav {...schoolNavProps} />
            </div>
            {deepGet(schoolDetails, 'data.currUser.isStudent') && <TabsRight>
                <Button onClick={this.classExit(this.props.match.params.class)}>
                    {intl.formatMessage({ id: 'intl.module.School.CourseIndex.exitClass' })}
                </Button>
            </TabsRight>}
            {NavWp}
        </div>
    }
}
