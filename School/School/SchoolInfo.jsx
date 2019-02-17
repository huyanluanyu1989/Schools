import React, { Component } from 'react'
import Tab from '../components/Tab/Tab'
import styles from './schoolInfo.less'
import SchoolAction from '../../../redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import { push } from 'connected-react-router'
import { classRoom } from '../../../routes/School'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import PropTypes from 'prop-types'
import { deepGet } from '$utils'
import { Nav, Loading } from '@microduino/micdesign'
import ErrorPage from '$components/ErrorPage'
import EmptyDataPlaceHolder from '$components/EmptyDataPlaceHolder'
import Card from '../../../components/Card'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape } from 'react-intl'

const PAGE_SIZE = 12
const mapStateToProps = state => ({
    isLogin: state.common.isLogin,
    detail: state.schoolDetail,
    error: state.currentDetail.error,
    pending: state.schoolDetail.pending,
    lists: state.currentPageList.data
})
const mapDispatchToProps = (dispatch, props) => ({
    push: bindActionCreators(push, dispatch),
    getDetail: () => dispatch(SchoolAction.detail(props.match.params.schoolId)),
    getAssets: (currentPage = 1, reload = false, options = {}) => {
        const params = {
            ...options,
            limit: PAGE_SIZE,
            skip: (currentPage - 1) * PAGE_SIZE
        }
        return dispatch(SchoolAction.schoolAssetList(params, reload))
    }
})
@injectIntl
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class SchoolInfo extends Component {
    static propTypes = {
        isLogin: PropTypes.bool,
        push: PropTypes.func,
        detail: PropTypes.object,
        getDetail: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        match: PropTypes.shape(),
        getAssets: PropTypes.func,
        lists: PropTypes.array,
        pending: PropTypes.bool,
        error: PropTypes.bool,
        intl: intlShape
    }
    state = { reload: true, visible: false, schoolId: this.props.match.params.schoolId }
    handleShow = () => {
    }
    handleCancel = () => {
        this.setState({ visible: false })
    }
    getList = (lists) => {
        let content
        if (this.props.pending && this.state.currentPage === 1) {
            content = <Loading />
        } else {
            if (lists.length > 0) {
                content = []
                lists.map((v, i) => { content.push(<Card data={v} key={v._id} />) })
            } else {
                content = <EmptyDataPlaceHolder />
            }
        }
        return content
    }
    handleNavClick = (i, v) => {
        switch (v) {
            case this.props.intl.formatMessage({ id: 'intl.module.School.SchoolInfo.micClassRoom' }):
                this.props.push(classRoom.fill({ schoolId: this.props.match.params.schoolId }))
                break
            case this.props.intl.formatMessage({ id: 'intl.module.School.SchoolInfo.schoolWebsite' }):
                window.open(deepGet(this, 'props.detail.data.website'))
                break
        }
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const { currentPage, reload, schoolId } = this.state
        const promises = [this.props.getAssets(currentPage, reload, { school: schoolId }), this.props.getDetail()]
        await Promise.all(promises)
    }

    render() {
        const data = [this.props.intl.formatMessage({ id: 'intl.module.School.SchoolInfo.schoolAsset' })]
        const { isLogin, detail, lists, pending, error, intl } = this.props
        const { currUser } = detail.data
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }
        let navList = [intl.formatMessage({ id: 'intl.module.School.SchoolInfo.micClassRoom' }), intl.formatMessage({ id: 'intl.module.School.SchoolInfo.schoolWebsite' })]

        if (!isLogin || deepGet(currUser, 'isStranger') === true) {
            navList = [intl.formatMessage({ id: 'intl.module.School.SchoolInfo.schoolWebsite' })]
        }
        return <div className={styles.schoolInfo}>
            <div className={styles.banner}>
                <div>
                    <img src={deepGet(detail, 'data.banner')} />
                    <Nav className={styles.more} arrow onClick={this.handleNavClick} list={navList}>
                        <div className={styles.btn}>{intl.formatMessage({ id: 'intl.module.School.SchoolInfo.more' })}</div>
                    </Nav>

                    <div className={styles.bannerTitle}><span>{deepGet(detail, 'data.name')}</span></div>

                    <div className={styles.tab}>
                        <Tab data={data} value={0} />
                    </div>

                </div>
            </div>
            <div className={styles.list}>
                <div>
                    {this.getList(lists)}
                </div>

            </div>
        </div>
    }
}
