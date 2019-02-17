import React, { Component } from 'react'
import styles from './JoinClass.less'
import { Input, Button } from '@microduino/micdesign'
import { injectIntl, intlShape } from 'react-intl'
@injectIntl
export default class JoinClass extends Component {
    static propTypes = {
        intl: intlShape
    }
    render() {
        const { intl } = this.props
        return <div className={styles.joinClass}>
            <div className={styles.formStyle}>
                <Input className={styles.customInput} placeholder={intl.formatMessage({ id: 'intl.module.School.joinClass.inputInviteCode' })} />
                <p>{intl.formatMessage({ id: 'intl.module.School.joinClass.applyInviteCode' })}</p>
                <Input className={styles.customInput} placeholder={intl.formatMessage({ id: 'intl.module.School.joinClass.inputYourName' })} />
                <p>{intl.formatMessage({ id: 'intl.module.School.joinClass.inputCorrectName' })}</p>
            </div>
            <div className={styles.btn}>
                <Button size={'small'}>{intl.formatMessage({ id: 'intl.module.School.joinClass.sendApply' })}</Button>
                <Button size={'small'}>{intl.formatMessage({ id: 'intl.module.School.joinClass.cancleApply' })}</Button>
            </div>
        </div>
    }
}
