import React, { Component } from 'react'
import { Message, Form, FormItem, Button, Search, Modal, Input, Loading } from '@microduino/micdesign'
import styles from './schoolList.less'
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import SchoolAction from '../../../redux/actions/School'
import { Link } from 'react-router-dom'
import { schoolDetail } from '../../../routes/School'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import EmptyDataPlaceHolder from '../../../components/EmptyDataPlaceHolder'
import Infinite from '../../../components/InfiniteScroll'
import { injectIntl, intlShape } from 'react-intl'
const PAGE_SIZE = 12
const mapStateToProps = state => ({
    isLogin: state.common.isLogin,
    list: state.currentPageList.data,
    total: state.currentPageList.total
})

const mapDispatchToProps = dispatch => ({
    schoolClassMember: (body) => dispatch(SchoolAction.schoolClassMember(body)),
    getSchool: (currentPage = 1, reload = false, options = {}) => {
        const params = {
            ...options,
            label: options.label,
            limit: PAGE_SIZE,
            skip: (currentPage - 1) * PAGE_SIZE
        }
        return dispatch(SchoolAction.list(params, reload))
    }
})
@injectIntl
@connect(mapStateToProps, mapDispatchToProps)
@asyncDataLoader
export default class SchoolList extends Component {
    static propTypes = {
        isLogin: PropTypes.bool,
        pending: PropTypes.bool,
        list: PropTypes.array,
        total: PropTypes.number,
        getSchool: PropTypes.func,
        registerAsyncDataLoader: PropTypes.func,
        reloadAsyncData: PropTypes.func,
        schoolClassMember: PropTypes.func,
        intl: intlShape
    }
    state = { reload: true, visible: false, currentPage: 1 }
    handleShow = () => {
        if (!this.props.isLogin) {
            Message.error(this.props.intl.formatMessage({ id: 'intl.module.School.SchoolList.pleaseLogin' }))
            return
        }
        this.setState({ visible: true })
    }
    handleCancel = () => {
        this.setState({ visible: false })
    }
    getNextPage = (currentPage) => {
        this.setState({ reload: false, currentPage })
    }

    handleTitleSearch = (e, v) => {
        this.setState({ name: v, currentPage: 1, reload: true })
    }
    schoolClassMember = () => {
        if (!this.form.state.isValid) {
            this.form.submit()
            return
        }
        const body = { ...this.form.getModel() }
        this.props.schoolClassMember(body).then(res => {
            this.setState({ loading: false, visible: false })
            const { currentPage, reload } = this.state
            this.props.schoolClassMember(currentPage, reload)
            Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.SchoolList.sendApplySuccess' }))
        }).catch(error => {
            console.error(error)
            Message.error(error.message || this.props.intl.formatMessage({ id: 'intl.module.School.SchoolList.invalid' }))
        })
    }

    constructor(props) {
        super(props)
        this.genCodeValidation = {
            validations: {
                lengthCheck: { min: 0, max: 20 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.SchoolList.mostAllow20' })
            }
        }
        this.remarkValidation = {
            validations: {
                lengthCheck: { min: 0, max: 7 }
            },

            validationErrors: {
                lengthCheck: this.props.intl.formatMessage({ id: 'intl.module.School.SchoolList.mostAllow7' })
            }
        }
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        const { name, currentPage, reload } = this.state
        await this.props.getSchool(currentPage, reload, { name })
    }

    componentDidUpdate(prevProps, prevState) {
        const { name, reload, currentPage } = this.state
        if (
            name !== prevState.name ||
            reload !== prevState.reload ||
            currentPage !== prevState.currentPage

        ) {
            this.props.reloadAsyncData()
        }
    }

    render() {
        const { pending, list, total, intl } = this.props
        return <div className={styles.schoolList}>
            <div className={`${styles.navigation}`}>
                <div>
                    <div className={styles.wp}>
                        <span>{intl.formatMessage({ id: 'intl.module.School.SchoolList.school' })}</span>
                        <div className={styles.search}>
                            <Search onClick={this.handleTitleSearch} placeholder={intl.formatMessage({ id: 'intl.module.School.SchoolList.inputSchoolName' })} />
                        </div>
                    </div>
                </div>
                <div>
                    <div className={styles.wp}>
                        <a onClick={this.handleShow}>{intl.formatMessage({ id: 'intl.module.School.SchoolList.InviteCodeJoin' })}</a>
                    </div>
                </div>
            </div>
            <div className={`${styles.schoolListWp} ${styles.wp}`}>
                {
                    ((lists) => {
                        let content
                        if (this.props.pending && this.state.currentPage === 1) {
                            content = <Loading />
                        } else {
                            if (lists.length > 0) {
                                content = []
                                lists.map((v, i) => {
                                    content.push(
                                        <Link className={`${styles.schoolCard}`} to={schoolDetail.fill({ schoolId: v._id })}
                                            key={v._id}>
                                            <p className={'text-overflow-1'}>{v.name}</p>
                                            <p>{v.description || intl.formatMessage({ id: 'intl.module.School.SchoolList.descriptionNull' })}</p>
                                            <img src={v.logo} />
                                        </Link>)
                                })
                            } else {
                                content = <EmptyDataPlaceHolder />
                            }
                        }
                        return content
                    })(list)
                }
            </div>
            <Infinite pending={pending} total={total} pageSize={PAGE_SIZE}
                requestHandler={this.getNextPage} />
            <Modal Button={<Button onClick={this.schoolClassMember} size={'small'} ></Button>
            } title={intl.formatMessage({ id: 'intl.module.School.SchoolList.applyJoinClass' })} className={`schoolFeatureModal ${styles.joinClass}`} width={350} height={250} visible={this.state.visible}
            onCancel={this.handleCancel}>
                <Form className={'formInline'} ref={(form) => {
                    this.form = form
                }}>
                    <FormItem required {...this.genCodeValidation} tips={intl.formatMessage({ id: 'intl.module.School.SchoolList.applyInviteCode' })} name={'genCode'}>
                        <Input placeholder={intl.formatMessage({ id: 'intl.module.School.SchoolList.inputInviteCode' })} />
                    </FormItem>
                    <FormItem required {...this.remarkValidation} tips={intl.formatMessage({ id: 'intl.module.School.SchoolList.inputName' })} name={'remark'}>
                        <Input placeholder={intl.formatMessage({ id: 'intl.module.School.SchoolList.inputYourName' })} />
                    </FormItem>
                </Form>

            </Modal>

        </div>
    }
}
