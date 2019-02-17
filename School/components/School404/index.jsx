import React, { Component } from 'react'
import styles from './index.less'
import { injectIntl, intlShape } from 'react-intl'
@injectIntl
export default class School404 extends Component {
    static propTypes = {
        intl: intlShape
    }
    render() {
        const { intl } = this.props
        return (
            <div className={styles.wp}>
                <img src={'../../../../../static/images/icons/asset404.png'} />
                <p>{intl.formatMessage({ id: 'intl.module.School.components.SchoonNav.pageNotExist' })}...</p>
            </div>
        )
    }
}
