import React, { Component } from 'react'
import { number, array, object, string, func, bool } from 'prop-types'
import styles from './index.less'
import AssetAction from '$redux/actions/Asset'
import { connect } from 'react-redux'
import { asyncDataLoader } from '@microduino/react-client-redux-helper/lib/dataLoader'
import { Loading, Message } from '@microduino/micdesign'
import ErrorPage from '$components/ErrorPage'
import defImage from './image/def.png'
import { deepGet, setOssImage, fileService } from '$utils'
import { injectIntl, intlShape } from 'react-intl'

const mapDispatchToProps = (dispatch, props) => ({
    getAssetImage: () => {
        return dispatch(AssetAction.assetImage())
    }
})
const mapStateToProps = (state) => {
    const allCanSelectedUrlArray = []
    const list = state.assetImage.data
    for (let item in list) {
        allCanSelectedUrlArray.push(list[item].url)
    }
    return {
        assetImage: state.assetImage,
        error: state.assetImage.error,
        list,
        allCanSelectedUrlArray
    }
}
@injectIntl
@connect(
    mapStateToProps,
    mapDispatchToProps
)
@asyncDataLoader

export default class HardwareCover extends Component {
    static propTypes = {
        registerAsyncDataLoader: func,
        getAssetImage: func,
        pending: bool,
        error: bool,
        list: object,
        cover: string,
        allCanSelectedUrlArray: array,
        onSelected: func.isRequired,
        maxSize: number,
        intl: intlShape
    }
    static defaultProps = { maxSize: 1 }// unit:mb
    handleClick = (v) => (e) => {
        e.stopPropagation()
        this._setVal(v.url)
    }
    resetInput = () => {
        // fix upload the same image can't trigger onchange event
        this.setState((state) => {
            return { fileReset: ++state.fileReset }
        })
    }
    handleFileUp = async (e) => {
        this.resetInput()
        const file = e.target.files[0]
        if (!this._checkSize(file)) return
        this.setState({ upLoading: true })

        try {
            const res = await fileService.upload([file], (i, p, url) => {
            })
            this._setVal(res[0].url)
        } catch (error) {
            Message.error(this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.NetworkBusy' }))
        } finally {
            this.setState({ upLoading: false })
        }
    }
    state = { fileReset: 1, cur: this.props.cover }
    _setVal = (url) => {
        this.setState({ cur: url })
        this.props.onSelected(url)
    }
    _checkSize = (f) => {
        if (f.size >= this.props.maxSize * 1024 * 1024) {
            Message.error(`${this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.MessageError0' })}[${this.props.maxSize}mb]${this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.MessageError1' })}，${this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.MessageError2' })}[${(f.size / 1024 / 1024).toFixed(2)}mb]${this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.MessageError3' })}`)
            return false
        }
        return true
    }

    constructor(props) {
        super(props)
        props.registerAsyncDataLoader(this)
    }

    async componentWillLoadAsyncData() {
        await Promise.all([this.props.getAssetImage()])
    }

    render() {
        const { allCanSelectedUrlArray, error, list, pending, intl } = this.props
        if (error) {
            return <div className={styles.hardwareCover}>
                <ErrorPage />
            </div>
        }
        if (pending) {
            return <div className={styles.hardwareCover}>
                <Loading />
            </div>
        }
        const selCover = deepGet(this, 'state.cur')
        return (
            <div className={`${styles.hardwareCover} ${this.state.upLoading ? styles.uploading : ''}`}>
                <div className={styles.uploadingHover}>
                    <div className={styles.spinner}>
                        <div className={styles.rect1} />
                        <div className={styles.rect2} />
                        <div className={styles.rect3} />
                        <div className={styles.rect4} />
                        <div className={styles.rect5} />
                    </div>
                </div>
                <div className={styles.top}>
                    {this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.WorksCover' })}
                </div>
                <div className={`${styles.center} clearFix`}>
                    {(() => {
                        const img = { backgroundImage: `url(${setOssImage(selCover || defImage, 444, 333)})` }
                        return <div style={img} className={`${styles.left} ${selCover ? styles.sel : ''}`}>
                            <p>
                                {this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.UploadCover' })}
                            </p>
                            <p>
                                {this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.Size' })}
                            </p>
                        </div>
                    })()}
                    <div className={styles.right}><span>{this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.ChoiceCoverImg' })}</span></div>
                </div>
                <ul className={styles.bottom}>
                    {(() => {
                        let img = { backgroundImage: `url(${setOssImage(selCover, 132, 102)})` }
                        if (selCover === undefined || allCanSelectedUrlArray.includes(selCover)) {
                            img = null
                        }

                        return <li style={img}
                            className={`${img ? styles.btnSel : ''}`}>
                            <label>
                                <input key={`inputFile${this.state.fileReset}`} onChange={this.handleFileUp}
                                    accept={'image/gif,image/jpeg,image/jpg,image/png,image/svg'}
                                    type={'file'} />
                                <span className={styles.tip1}>{intl.formatMessage({ id: 'intl.module.School.components.HardwareCover.uploadCover' })}</span>
                                <span className={styles.tip2}>{intl.formatMessage({ id: 'intl.module.School.components.HardwareCover.resetUpload' })}</span>
                            </label>
                        </li>
                    })()}
                    {(() => {
                        const res = []
                        for (let item in list) {
                            const img = { backgroundImage: `url(${setOssImage(list[item].url, 132, 102)})` }
                            res.push(
                                <li className={this.state.cur === list[item].url ? styles.itemCur : ''}
                                    style={img} onClick={this.handleClick(list[item])} key={item}>
                                    <p>{list[item].name}</p>
                                    <div className={styles.iconHover} />
                                </li>
                            )
                        }
                        return res
                    })()}
                </ul>
            </div>
        )
    }
}
