import React, { Component } from 'react'
import Action from '../../../redux/actions/School'
import connect from 'react-redux/es/connect/connect'
import PropTypes from 'prop-types'
import { Message, TextBtn, Loading } from '@microduino/micdesign'
import { deepGet } from '$utils'
import ErrorPage from '$components/ErrorPage'
import { injectIntl, intlShape } from 'react-intl'

const mapStateToProps = state => ({
    list: state.applyPageList,
    total: state.applyPageList.total
})

const mapDispatchToProps = (dispatch, props) => ({
    allowApply: (id, apply) => dispatch(Action.schoolClassApproval(id, apply))

})
@injectIntl
@connect(mapStateToProps, mapDispatchToProps)
export default class ClassApplyList extends Component {
    static propTypes = {
        pending: PropTypes.bool,
        list: PropTypes.object,
        error: PropTypes.bool,
        allowApply: PropTypes.func,
        intl: intlShape
    }
    handleApply = (id, apply) => () => {
        this.props.allowApply(id, apply).then(() => {
            Message.success(this.props.intl.formatMessage({ id: 'intl.module.School.ClassApplyList.success' }))
        }).catch(error => {
            console.error(error)
            Message.error(this.props.intl.formatMessage({ id: 'intl.module.School.ClassApplyList.netWorkBusy' }))
        })
    }

    render() {
        const { list, pending, error, intl } = this.props
        if (pending) {
            return <Loading />
        }

        if (error) {
            return <ErrorPage />
        }

        return <table className={'mic-Table'}>
            <tbody>
                <tr>
                    <th>{intl.formatMessage({ id: 'intl.module.School.ClassApplyList.className' })}</th>
                    <th>{intl.formatMessage({ id: 'intl.module.School.ClassApplyList.validation' })}</th>
                    <th>{intl.formatMessage({ id: 'intl.module.School.ClassApplyList.operation' })}</th>
                </tr>
                {((list) => {
                    const content = []
                    deepGet(list, 'data', []).map((v, i) => {
                        content.push(
                            <tr key={v._id}>
                                <td>{deepGet(v, 'class.nickname')}</td>
                                <td>{v.remark}</td>
                                <td><TextBtn onClick={this.handleApply(v._id, true)}>{intl.formatMessage({ id: 'intl.module.School.ClassApplyList.agree' })}</TextBtn>
                                    <TextBtn type={'delete'} onClick={this.handleApply(v._id, false)}>{intl.formatMessage({ id: 'intl.module.School.ClassApplyList.refuse' })}</TextBtn>
                                </td>
                            </tr>)
                    })
                    return content.length > 0 ? content : <tr ><td colSpan={3}>{intl.formatMessage({ id: 'intl.module.School.ClassApplyList.notApplyInfo' })}</td></tr>
                })(list)}
            </tbody>
        </table>
    }
}
