import React, { Component } from 'react'
import styles from './index.less'
import { any } from 'prop-types'

export default class ListInfo extends Component {
    static propTypes = {
        children: any
    }
    render() {
        return <div className={styles.wp}>
            <div className={styles.container}>
                {this.props.children}
            </div>

        </div>
    }
}
