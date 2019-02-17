import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Tab.less'
import classNames from 'classnames/bind'

const classBind = classNames.bind(styles)
export default class Tab extends Component {
    static propTypes = {
        data: PropTypes.array,
        value: PropTypes.number
        // getValue: PropTypes.func
    }

    state = { value: this.props.value, data: this.props.data, checked: false }
    handleClick = (e) => {
        const val = Number(e.currentTarget.getAttribute('value'))
        this.setState({
            value: val
        })
    }

    _isContainer = (checkedVal, val) => {
        let res = false
        if (checkedVal === val) {
            res = true
        }
        return res
    }

    render() {
        let views = []
        const { data } = this.props

        data.map((v, i) => {
            let onClick = { onClick: this.handleClick }
            const checked = this._isContainer(this.state.value, i)
            const wrapperClassName = classBind(
                'mic-Tab',
                { 'active': checked }
            )
            views.push(<span key={i} value={i} className={wrapperClassName} {...onClick}
                data-checked={this.state.checked}>{v}</span>
            )
        })
        return views.map(v => v)
    }
}
