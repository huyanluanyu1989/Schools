import React, { Component } from 'react'
import styles from './index.less'
import ListInfo from '$src/modules/School/components/ListInfo'
import Action from '$redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import PropTypes from 'prop-types'
import { Loading, Pagination } from '@microduino/micdesign'
import ErrorPage from '$components/ErrorPage'
import { withRouter } from 'react-router'
// import { Link } from 'react-router-dom'
// import { classCourse } from '$routes/School'
// import classStu from '../../../../static/images/school/class_stu.png'
// import classCourseImg from '../../../../static/images/school/class_course.png'
// import EmptyDataPlaceHolder from '$components/EmptyDataPlaceHolder'
const PAGE_SIZE = 5
const mapStateToProps = state => ({
    list: state.currentPageList.data,
    total: state.currentPageList.total
})

const mapDispatchToProps = (dispatch, props) => ({
    getHomework: (currentPage = 1, reload = false, options = {}) => {
        const params = {
            ...options,
            label: options.label,
            limit: PAGE_SIZE,
            skip: (currentPage - 1) * PAGE_SIZE
        }
        return dispatch(Action.classHomeworkList(props.match.params.class, params, reload))
    }
})
@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class ClassHomework extends Component {
    static propTypes = {
        pending: PropTypes.bool,
        list: PropTypes.array,
        total: PropTypes.number,
        getHomework: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        error: PropTypes.bool,
        match: PropTypes.shape()
    }
    state = { reload: true, currentPage: 1 }
    // getList = (lists) => {
    //     console.log(this.props, 'this.props.match.params.id')
    //     let content
    //     if (this.props.pending && this.state.currentPage === 1) {
    //         content = <Loading />
    //     } else {
    //         if (lists.length > 0) {
    //             content = []
    //             lists.map((v, i) => {
    //                 content.push(<div key={i}>
    //                     <Link to={classCourse.fill({ class: v._id })}>
    //                         <div className={'lf'}>
    //                             <span>{v.nickname}</span>
    //                             <span>班主任</span>
    //                         </div>
    //                         <div className={'rt'}>
    //                             <div><img src={classStu} /><span>学生：{v.counter.member}</span></div>
    //                             <div><img src={classCourseImg} /><span>课程：{v.counter.course}</span></div>
    //                         </div>
    //                     </Link>
    //                 </div>)
    //             })
    //         } else {
    //             content = <EmptyDataPlaceHolder />
    //         }
    //     }
    //     return content
    // }
    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const { currentPage, reload } = this.state
        await this.props.getHomework(currentPage, reload, {})
    }
    render() {
        const { list, total, pending, error, match } = this.props
        console.log(list, 'list', this.props, match)
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }
        return <div className={styles.container}>
            <ListInfo />
            <Pagination defaultPageSize={PAGE_SIZE} onChange={this.onChange} current={this.state.currentPage} total={total} />
        </div>
    }
}
