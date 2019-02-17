import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './index.less'

export default class Tabs extends Component {
    static propTypes = {
        nav: PropTypes.array,
        children: PropTypes.array,
        cur: PropTypes.number,
        onClick: PropTypes.func
    }
    static defaultProps = {
        cur: 0,
        onClick: (i) => {
        }
    }
    state = { cur: this.props.cur }
    handleTabClick = (i) => () => {
        this.setState({ cur: i })
        this.props.onClick(i)
    }

    render() {
        const { nav, children } = this.props
        return (
            <div className={styles.wp}>
                <div className={'mic-Tabs'}>
                    <div>
                        <div className={'mic-Tabs-nav'}>
                            {nav.map((v, i) => <div key={i} onClick={this.handleTabClick(i)}>
                                <a className={this.state.cur === i ? 'mic-Tabs-nav-cur' : ''}>{v}</a>
                            </div>)}
                        </div>
                    </div>

                    <div className={'mic-Tabs-content'}>
                        {children.map((v, i) => {
                            return (this.state.cur === i && <div className={'mic-scrollbar'} key={`content${i}`}>{v}</div>)
                        })}
                    </div>
                </div>
            </div>
        )
    }
}
