import React, { Component } from 'react'
import { any } from 'prop-types'
import styles from './index.less'
export default class ListCard extends Component {
    static propTypes = {
        children: any
    }
    render() {
        return <div className={'container'}>
            <div className={styles.container}>
                <div className={styles.cardList}>
                    <div>
                        {this.props.children}
                    </div>
                </div>
            </div>
        </div>
    }
}
