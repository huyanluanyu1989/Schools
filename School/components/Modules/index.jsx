import React, { Component, Fragment } from 'react'
import { Search, Button, Modal, Image, Loading } from '@microduino/micdesign'
import { injectIntl, intlShape } from 'react-intl'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { setOssImage } from '$utils'
import KitAction from '$redux/actions/Kit'
import ModuleAction from '$redux/actions/Module'
import styles from './index.less'
import ErrorPage from '$components/ErrorPage/index'

const mapStateToProps = state => ({
    error: state.selector.error || state.currentDetail.error,
    currentDetail: state.currentDetail.data,
    modules: state.selector.modules,
    kits: state.selector.kits
})

const mapDispatchToProps = dispatch => ({
    getModules: (kitId) => {
        let params = {
            limit: 1000,
            skip: 0
        }
        if (kitId) {
            params.kitId = [kitId]
        }
        return dispatch(ModuleAction.listAll(params, true))
    },
    getKits: () => dispatch(KitAction.listAll({
        isOption: true,
        limit: 1000,
        skip: 0
    }))
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    let cart = []
    const { currentDetail } = stateProps
    if (currentDetail.modules) {
        cart = currentDetail.modules.map((item) => ({
            image: item.module.image,
            name: item.module.name,
            _id: item.module._id,
            num: item.num
        }))
        const res = []
        cart.map((v, i) => {
            res.push({ module: v._id, num: v.num })
        })
        ownProps.sendData(res)
    }
    return Object.assign({}, ownProps, stateProps, dispatchProps, { cart })
}

@injectIntl
@connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)

export default class Modules extends Component {
    static propTypes = {

        modules: PropTypes.array,
        kits: PropTypes.array,
        error: PropTypes.bool,
        sendData: PropTypes.func,
        getModules: PropTypes.func,
        getKits: PropTypes.func,
        cart: PropTypes.array,
        intl: intlShape
    }

    state = {

        showModal: false,
        allModule: [],
        loading: false,
        moduleLoading: false,
        cart: this.props.cart,
        kitId: '',
        searchKey: ''
    }

    handleFilter = (e) => {
        const val = e.currentTarget.value
        const allModule = this.props.modules.filter((v) => v.name.toUpperCase().indexOf(val.toUpperCase()) !== -1)
        this.setState({
            allModule,
            searchKey: val
        })
    }

    isActive = (target) => {
        return target.getAttribute('class')
    }

    handleTagClick = async (e) => {
        if (this.isActive(e.currentTarget)) {
            return false
        }
        this.setState({
            moduleLoading: true
        })
        const kitId = e.currentTarget.getAttribute('id')
        await this.props.getModules(kitId)
        this._setModule()
        this.setState({
            kitId: kitId,
            moduleLoading: false
        })
    }
    handleAddCart = (id) => () => {
        this._cartHelper(id)
    }
    handleDelCart = (id) => () => {
        this._cartHelper(id, '-')
    }

    handleAdd = async () => {
        this.setState((state, props) => ({
            showModal: true,
            loading: !props.kits,
            moduleLoading: true
        }))

        const promises = [this.props.getKits(), this.props.getModules(this.state.kitId)]
        const res = await Promise.all(promises)
        if (res[0]) {
            res[0].value.data.unshift({
                active: true,
                name: this.props.intl.formatMessage({ id: 'intl.modules_Asset.HardwareCover.All' }),
                _id: ''
            })
        }
        this._setModule()
        this.setState({
            loading: false,
            moduleLoading: false
        })
    }
    handleCancel = () => {
        this.setState({ showModal: false })
    }

    _setModule = () => {
        const { modules } = this.props
        let allModule = modules.map((v) => {
            // 和cart匹配，获取已经选择的模块数量，并赋值
            const cartItem = this._isContain(v._id, this.state.cart)
            v.num = cartItem ? cartItem.num : 0
            return v
        })
        allModule = allModule.filter((v) => v.name.toUpperCase().indexOf(this.state.searchKey.toUpperCase()) !== -1)
        this.setState({
            allModule
        })

        this._sendData()
    }

    _isContain = (id, obj = []) => {
        let res = null
        obj.some((item, index) => {
            if (item._id === id) {
                res = item
                res.index = index
                return true
            }
            return false
        })
        return res
    }
    _cartHelper = (id, type = '+') => {
        let cartItem = this._isContain(id, this.state.cart)
        if (cartItem) {
            switch (type) {
                case '+':
                    cartItem.num += 1
                    break
                case '-':
                    cartItem.num -= 1
                    if (cartItem.num <= 0) {
                        this.state.cart.splice(cartItem.index, 1)
                    }
                    break
                default:
                    this.state.cart.splice(cartItem.index, 1)
                    break
            }
        } else {
            if (type === '+') {
                cartItem = this._isContain(id, this.state.allModule)
                cartItem.num = 1
                this.state.cart.push(cartItem)
            }
        }

        const moduleItem = this._isContain(id, this.state.allModule)
        if (moduleItem && cartItem) {
            moduleItem.num = cartItem.num
        }

        this.setState((state) => ({ cart: state.cart, allModule: state.allModule }))
        this._sendData()
    }

    _sendData = () => {
        const res = []
        this.state.cart.map((v, i) => {
            res.push({ module: v._id, num: v.num })
        })
        this.props.sendData(res)
    }

    render() {
        const { error, kits, intl } = this.props
        const { loading, moduleLoading } = this.state

        if (error) {
            return <ErrorPage />
        }

        const kitNodes = (kits || []).map((v, i) => {
            return <button type='button' id={v._id} onClick={this.handleTagClick} key={i}
                className={v._id === this.state.kitId ? styles.active : ''}>{v.name}</button>
        })

        let carts = null
        if (this.state.cart.length > 0) {
            carts = this.state.cart.map((v, i) => {
                return (
                    <div key={i} className={styles.moduleCard}>
                        <Image src={setOssImage(v.image, 100, 100)} />
                        <p className='text-overflow-1'>{v.name}</p>
                        <button type='button' onClick={this.handleDelCart(v._id)} className={styles.btnDel} />
                        <span>{v.num}</span>
                        <button type='button' onClick={this.handleAddCart(v._id)} className={styles.btnAdd} />
                    </div>
                )
            })
        }

        const subBtnText = intl.formatMessage({ id: 'intl.micDesign_Modal_subBtnText' })

        return (
            <span>
                <div>
                    {carts && <div className={`${styles.resWrapper} mic-scrollbar clearFix`}> {carts}</div>}
                    {carts ? <div className={styles.addBtnHasKit} onClick={this.handleAdd}>{intl.formatMessage({ id: 'intl.module.School.components.Modules.addHardware' })}</div>
                        : <div className={styles.addBtn} onClick={this.handleAdd}>{intl.formatMessage({ id: 'intl.module.School.components.Modules.addHardware' })}</div>}
                </div>
                <Modal width={900} height={515} Button={<Button onClick={this.handleCancel}>{subBtnText}</Button>}
                    className='Modules'
                    title={intl.formatMessage({ id: 'intl.components_FormModules_Modules.SelectHardware' })}
                    onCancel={this.handleCancel}
                    visible={this.state.showModal}>
                    {loading ? <Loading /> : (
                        <Fragment>
                            <div className={`${styles.search} clearFix`}>
                                <Search onChange={this.handleFilter}
                                    placeholder={intl.formatMessage({ id: 'intl.components_FormModules_Modules.Search' })} />
                            </div>
                            <div className={styles.mainWrapper}>
                                <div className={styles.kitWrapper}>
                                    {kitNodes}
                                </div>
                                {moduleLoading ? <Loading /> : (
                                    <div className={styles.moduleWrapper}>
                                        {this.state.allModule && this.state.allModule.length > 0 ? this.state.allModule.map((v, i) => {
                                            return <div key={i} className={styles.moduleCard}>
                                                <Image src={setOssImage(v.image, 100, 100)} />
                                                <p className='text-overflow-1'>{v.name}</p>
                                                <button type='button' onClick={this.handleDelCart(v._id)}
                                                    className={styles.btnDel} />
                                                <span>{v.num || 0}</span>
                                                <button type='button' onClick={this.handleAddCart(v._id)}
                                                    className={styles.btnAdd} />
                                            </div>
                                        }) : <div
                                            className={'noData'}>{intl.formatMessage({ id: 'intl.components_FormModules_Modules.None' })}</div>}
                                    </div>
                                )}
                            </div>
                        </Fragment>
                    )}
                </Modal>
            </span>
        )
    }
}
