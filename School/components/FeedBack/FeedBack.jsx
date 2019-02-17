import React, { Component } from 'react'
import styles from './FeedBack.less'
import { TextArea, Button } from '@microduino/micdesign'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import PropTypes from 'prop-types'
@asyncDataLoader
export default class FeedBack extends Component {
    static propTypes = {
        registerAsyncDataLoader: PropTypes.func,
    }
    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }
    async componentWillLoadAsyncData() {
    }
    render() {
        return <div className={styles.feedBack}>
            <p>{`"他山之石, 可以攻玉"`}</p>
            <p>您遇到了任何问题或是有什么好的建议, 都可以发送给我们, 帮助我们进行改进以便提供更好的服务.</p>
            <TextArea />
            <Button size={'small'}>提交反馈</Button>
            <Button size={'small'}>暂不反馈</Button>
        </div>
    }
}
