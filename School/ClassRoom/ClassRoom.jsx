import React, { Component } from 'react'
import Tabs from '../components/TabComponent'
import styles from './classRoom.less'
import SchoolNav from '../components/SchoolNav'
import PrepareCourse from '../PrepareCourse/PrepareCourse'
import ClassList from './ClassList'
import StudentClassList from './StudentClassList'
import PropTypes from 'prop-types'
import Action from '$redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import { Loading } from '@microduino/micdesign'
import ErrorPage from '$components/ErrorPage'
import { deepGet } from '$utils'
// import useGuide from '../../../../static/images/school/useGuide.png'
// import TabsRight from '../components/TabsRight'
import School404 from '$src/modules/School/components/School404'
import { injectIntl, intlShape } from 'react-intl'

const mapStateToProps = state => ({
    schoolDetails: state.schoolDetail
})
const mapDispatchToProps = (dispatch, props) => ({
    getSchoolDetail: () => dispatch(Action.detail(props.match.params.schoolId))
})
@injectIntl
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class ClassRoom extends Component {
    static propTypes = {
        schoolDetails: PropTypes.object,
        registerAsyncDataLoader: PropTypes.func,
        getSchoolDetail: PropTypes.func,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        intl: intlShape
    }
    state = { reload: true }
    getTab = (isTeacher, isStudent) => {
        let tabChild = ''
        if (isTeacher === true) {
            tabChild = <ClassList />
        } else if (isStudent === true) {
            tabChild = <StudentClassList />
        }
        return tabChild
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        await this.props.getSchoolDetail()
    }

    render() {
        const { pending, error, schoolDetails, intl } = this.props
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
        let tabData = [intl.formatMessage({ id: 'intl.module.School.ClassRoom.myClass' })]
        if (deepGet(schoolDetails.data, 'currUser.isSchoolTeacher') === true) {
            tabData = [intl.formatMessage({ id: 'intl.module.School.ClassRoom.myClass' }), intl.formatMessage({ id: 'intl.module.School.ClassRoom.prepareManagement' })]
        }
        const NavWp = (
            <div className={styles.tab}>
                <Tabs cur={0} nav={tabData}>
                    {[
                        <div key={0}>
                            {/* <StudentClassList /> */}
                            {this.getTab(deepGet(schoolDetails.data, 'currUser.isSchoolTeacher'), deepGet(schoolDetails.data, 'currUser.isStudent'))}
                        </div>,
                        <div key={1}>
                            <PrepareCourse />
                        </div>
                    ]}
                </Tabs>
            </div>
        )
        const schoolNavProps = {
            schoolObj: { id: deepGet(schoolDetails, 'data._id'), name: deepGet(schoolDetails, 'data.name') }
        }
        return <div className={styles.container}>
            <SchoolNav {...schoolNavProps} />
            {/* <TabsRight>
                {deepGet(schoolDetails.data, 'currUser.isSchoolTeacher') && <div><img src={useGuide} />
                    <span>使用指南</span></div>}
            </TabsRight> */}
            {NavWp}
        </div>
    }
}
