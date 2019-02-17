import React, { Component } from 'react'
import { any } from 'prop-types'
import styles from './index.less'

export default class TabsRight extends Component {
    static propTypes = {
        children: any
    }
    render() {
        return <div className={styles.useGuide}>
            <div>
                <div>
                    {this.props.children}
                </div>
            </div>
        </div>
    }
}
