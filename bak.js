import React from 'react'
import { Checkbox, Collapse, Tabs, Radio, Row, Col, Icon } from 'antd'
import './component.scss'
import TitleDivision from 'components/TitleDivision'
import AuthWrap from 'components/AuthWrap'
import RelationalTemplate from 'components/RelationalTemplate'
import { hzAuth } from "components/withAuth"

const Panel = Collapse.Panel;
const { TabPane } = Tabs;
let returnItemArr = [];
class DisplaySchemaRange extends React.Component {
  constructor(props) {

    super()
    this.state = {
      all_checkbox_control: {
        OUT_V: {
          checked: false,
          checkList: [],
          checkedNum: 0,
          defaultCheckList: []
        },
        OUT_E: {
          checked: false,
          checkList: [],
          checkedNum: 0
        },
        vHeaderFlag: false,
        eHeaderFlag: false,
        lHeaderFlag: false,
      },
      currentRule: '',
      vertexesDisabled: true,
      defaultTemplateId: '',
      activeKey: '1',
    }
    this.prevVertex = [] // 上次选择的实体
    this.prevSchemaOptions = []
    // this.defaultTemplateId = ''
  }

  /**
   * @param {*} item 当前改变的边或者实体
   * @param {*} type 实体 | 边
   * @param {*} event
   */
  checkChangeHandler(item, type, event) {
    let checked = event.target.checked
    item.checked = checked
    let checkedNum = this.state.all_checkbox_control[type].checkedNum
    let allChecked = false

    // 边|实体 进行全选判断
    const CHECKBOXES_LENGTH = this.props.schemaOptions[type].length
    if (!checked) {
      checkedNum--
      allChecked = false
    } else {
      checkedNum++
      if (CHECKBOXES_LENGTH === checkedNum) {
        allChecked = true
      }
    }
    this.setState({
      all_checkbox_control: Object.assign({}, this.state.all_checkbox_control, { [type]: { checked: allChecked, checkedNum } })
    })

    // 勾选关系之后自动选择实体
    if (type === 'OUT_E') {
      // 获取全部的实体，之后进行筛选，处理实体勾选
      this.checkVertexes()
    }
  }
  uniqueArr(arr) {
    return Array.from(new Set(arr))
  }

  // 全选操作
  allCheckChangleHandler(type, event) {
    const checked = event.target.checked
    const checkedNum = checked ? this.props.schemaOptions[type].length : 0
    this.props.schemaOptions[type].forEach(item => item.checked = checked)
    this.setState({
      all_checkbox_control: Object.assign({}, this.state.all_checkbox_control, { [type]: { checked, checkedNum } })
    }, () => {
      if (type === 'OUT_E') {
        this.props.setDefaultTemplate('outE')
        this.checkVertexes()
      }
    })
  }

  // 获取当前状态下的 edge ，并勾选对应的 vertexes

  checkVertexes() {
    // let checkedNum = this.state.all_checkbox_control['OUT_E'].checkedNum
    let that = this
    this.props.getVertexesRelation(() => {
      console.log('重新拉取')
      var edgeCheckList = that.props.schemaOptions ? that.props.schemaOptions.OUT_E : []
      var tempVertexesCheckList = []

      // 取到全部实体
      const allVertexesList = that.props.vertexesRelation
      if (!allVertexesList && !allVertexesList.data) {
        return
      }

      const prevSchemaOptions = that.prevSchemaOptions.OUT_E

      // 当前选择的边
      const nowSelectedEdge = edgeCheckList.filter(item => item.checked)
      // 上次选择的边
      const prevSelectedEdge = prevSchemaOptions.filter(item => item.checked)

      // 两次是否有变化
      const noDiff = nowSelectedEdge.length === prevSelectedEdge.length && nowSelectedEdge.every(item => prevSelectedEdge.some(cur => cur.name === item.name))
      console.log(`勾选的关系是否发生变化: ${noDiff ? '否' : '是'}`)
      console.log(nowSelectedEdge.length)
      console.log(prevSelectedEdge.length)
      if (noDiff) return
      // 上次勾选的实体
      const prevSelectedVertex = this.prevSchemaOptions.OUT_V.filter(item => item.checked)

      // 新增或者减少
      const isAdd = nowSelectedEdge.length > prevSelectedEdge.length
      let diff
      // 寻找新增或者减少的关系
      if (isAdd) {
        diff = nowSelectedEdge.filter(item => prevSelectedEdge.every(cur => cur.name !== item.name))
      } else {
        diff = prevSelectedEdge.filter(item => nowSelectedEdge.every(cur => cur.name !== item.name))
      }
      console.log(isAdd ? '新增' : '减少', diff)



      // 先取消所有的勾选
      that.props.schemaOptions['OUT_V'].forEach(item => item.checked = false)
      for (var i = 0; i < edgeCheckList.length; i++) {
        for (var j = 0; j < allVertexesList.data.length; j++) {
          if (edgeCheckList[i].checked && edgeCheckList[i].name === allVertexesList.data[j].schemaName) {
            tempVertexesCheckList.push(allVertexesList.data[j].fromVertexSchema, allVertexesList.data[j].toVertexSchema)
            // eslint-disable-next-line no-loop-func
            that.props.schemaOptions['OUT_V'].forEach(item => {
              if (item.name === allVertexesList.data[j].fromVertexSchema || item.name === allVertexesList.data[j].toVertexSchema) {
                item.checked = true
              }
            })
          }
        }
      }

      // 去重
      var vertexesCheckList = that.uniqueArr(tempVertexesCheckList).filter(item => that.props.schemaOptions['OUT_V'].some(cur => cur.name === item))
      var vertexesCheckedNum = that.props.schemaOptions['OUT_V'].length - vertexesCheckList.length
      that.setState({
        all_checkbox_control: Object.assign({}, that.state.all_checkbox_control, { 'OUT_V': { checked: !vertexesCheckedNum, checkedNum: vertexesCheckList.length, defaultCheckList: vertexesCheckList } })
      })
    })
    // checkedNum === 0 ? this.setState({ vertexesDisabled: true }) : this.setState({ vertexesDisabled: false })
  }

  checkVertexes1() {
    let checkedNum = this.state.all_checkbox_control['OUT_E'].checkedNum
    let that = this
    this.props.getVertexesRelation(data => {
      var edgeCheckList = that.props.schemaOptions ? that.props.schemaOptions.OUT_E : []
      var tempVertexesCheckList = []

      // 取到全部实体
      const allVertexesList = that.props.vertexesRelation
      if (!allVertexesList && !allVertexesList.data) {
        return
      }

      // 先取消所有的勾选
      that.props.schemaOptions['OUT_V'].forEach(item => item.checked = false)
      for (var i = 0; i < edgeCheckList.length; i++) {
        for (var j = 0; j < allVertexesList.data.length; j++) {
          if (edgeCheckList[i].checked && edgeCheckList[i].name === allVertexesList.data[j].schemaName) {
            tempVertexesCheckList.push(allVertexesList.data[j].fromVertexSchema, allVertexesList.data[j].toVertexSchema)
            // eslint-disable-next-line no-loop-func
            that.props.schemaOptions['OUT_V'].forEach(item => {
              if (item.name === allVertexesList.data[j].fromVertexSchema || item.name === allVertexesList.data[j].toVertexSchema) {
                item.checked = true
              }
            })
          }
        }
      }

      // 去重
      var vertexesCheckList = that.uniqueArr(tempVertexesCheckList).filter(item => that.props.schemaOptions['OUT_V'].some(cur => cur.name === item))
      var vertexesCheckedNum = that.props.schemaOptions['OUT_V'].length - vertexesCheckList.length
      that.setState({
        all_checkbox_control: Object.assign({}, that.state.all_checkbox_control, { 'OUT_V': { checked: !vertexesCheckedNum, checkedNum: vertexesCheckList.length, defaultCheckList: vertexesCheckList } })
      })
    })
    checkedNum === 0 ? this.setState({ vertexesDisabled: true }) : this.setState({ vertexesDisabled: false })
  }

  // initAllCheckboxConfig(schemaOptions) {
  //   this.setState({
  //     all_checkbox_control: {
  //       OUT_V: {
  //         checked: true,
  //         checkedNum: schemaOptions.OUT_V.length
  //       },
  //       OUT_E: {
  //         checked: true,
  //         checkedNum: schemaOptions.OUT_E.length
  //       }
  //     }
  //   })
  // }

  initAllCheckboxConfig(schemaOptions) {
    this.setState({
      all_checkbox_control: {
        OUT_V: {
          checked: false,
          checkedNum: 0
        },
        OUT_E: {
          checked: false,
          checkedNum: 0
        }
      }
    })
  }

  collapseChangeHandler(n) {
    switch (n) {
      case 1:
        this.setState({
          vHeaderFlag: !this.state.vHeaderFlag
        })
        break;
      case 2:
        this.setState({
          eHeaderFlag: !this.state.eHeaderFlag
        })
        break;
      case 3:
        this.setState({
          lHeaderFlag: !this.state.lHeaderFlag
        })
        break;
      default:
    }

  }

  showModalBoxHandler(type) {
    this.setState({
      currentRule: type
    })
  }
  hideModalBoxHandler() {
    this.setState({
      currentRule: ''
    })
  }

  // defaultTemplate
  selectTemplateHandler(e) {
    this.setState({
      defaultTemplateId: e.target.value
    })
    // 切换关系模版时，获取当前选中模版得到对应的vertexlist
    let defaultTemp = undefined
    defaultTemp = this.props.usedTemplateList.filter((item) => {
      return item.id === e.target.value
    })
    // 拿出当前关系模版下的rule，判断出相关联的实体，进行默认勾选
    this.selectEntitiesAccordingTemplate(defaultTemp[0].rule)
    this.props.setDefaultTemplate('template', e.target.value)
  }
  changeActiveKeyHandler(key) {
    this.props.changeActiveRelation && this.props.changeActiveRelation(key)
    this.setState({
      activeKey: key
    })
    if (key === '2') {
      // 切换关系列表时，获取edgelist得到对应的vertexlist
      this.checkVertexes()
      // 如果是输出实体 的话传值的时候就不用传对应的数据了
      this.props.setDefaultTemplate('outV')
    } else {
      // 切换关系模版时，获取当前选中模版得到对应的vertexlist
      let defaultTemp = undefined
      defaultTemp = this.props.usedTemplateList.filter((item) => {
        return item.id === this.state.defaultTemplateId
      })
      // 防止出现缺少模板 然后导致的报错问题
      if (!defaultTemp || defaultTemp.length <= 0 ) {
        return
      }
      // 拿出当前关系模版下的rule，判断出相关联的实体，进行默认勾选
      this.selectEntitiesAccordingTemplate(defaultTemp[0].rule)
      this.props.setDefaultTemplate('template', this.state.defaultTemplateId)
    }
  }

  // 拿出当前关系模版下的rule，判断出相关联的实体，进行默认勾选
  selectEntitiesAccordingTemplate(rule) {
    let that = this
    rule = JSON.parse(rule)
    this.findEdge(rule.filters)

    // 去重
    var uniqueEdgeList = this.uniqueArr(returnItemArr)
    // 关系模版与关系列表操作不同，后期优化 --start
    this.props.getVertexesRelation(data => {
      // var edgeCheckList = that.props.schemaOptions ? that.props.schemaOptions.OUT_E : []
      var tempVertexesCheckList = []

      // 取到全部实体
      const allVertexesList = that.props.vertexesRelation
      if (!allVertexesList && !allVertexesList.data) {
        return
      }

      // 先取消所有的勾选
      that.props.schemaOptions['OUT_V'].forEach(item => item.checked = false)
      for (var i = 0; i < uniqueEdgeList.length; i++) {
        for (var j = 0; j < allVertexesList.data.length; j++) {
          if (uniqueEdgeList[i] === allVertexesList.data[j].schemaName) {
            tempVertexesCheckList.push(allVertexesList.data[j].fromVertexSchema, allVertexesList.data[j].toVertexSchema)
            // eslint-disable-next-line no-loop-func
            that.props.schemaOptions['OUT_V'].forEach(item => {
              if (item.name === allVertexesList.data[j].fromVertexSchema || item.name === allVertexesList.data[j].toVertexSchema) {
                item.checked = true
              }
            })
          }
        }
      }

      // 去重
      var vertexesCheckList = that.uniqueArr(tempVertexesCheckList)
      var vertexesCheckedNum = that.props.schemaOptions['OUT_V'].length - vertexesCheckList.length
      that.setState({
        all_checkbox_control: Object.assign({}, that.state.all_checkbox_control, { 'OUT_V': { checked: !vertexesCheckedNum, checkedNum: vertexesCheckList.length, defaultCheckList: vertexesCheckList } })
      })
      // 用完后清空数据
      returnItemArr = []
    })
    // 关系模版与关系列表操作不同，后期优化 --end
  }

  // 根据关系模版，得出模版中所有的关系name
  findEdge(arr) {
    if (!arr) {
      return
    }
    arr.forEach((item) => {
      if (item.logicConnector === undefined) {
        returnItemArr.push(item.schemaName)
      } else {
        this.findEdge(item.filters)
      }
    })
  }

  setHistoryRecord (history) {
      let {usedTemplateList} =  this.props
      // || (usedTemplateList !== this.props.usedTemplateList)
      // usedTemplateList = usedTemplateList.data?usedTemplateList.data:usedTemplateList
      if (history.activeKey+'' === '1') {
        // 如果存在id说明有templateId
        // 设置templateId
        let defaultId = undefined;
        let defaultIdArr = []
        defaultIdArr = usedTemplateList.filter((item) => {
          if (history.id) {
            return history.id === item.id
          } else {
            return item.default === true
          }
        })
        if (defaultIdArr.length > 0) {
          this.setState({
            defaultTemplateId: defaultIdArr[0].id
          })
          defaultId = defaultIdArr[0].id
          // this.props.setDefaultTemplate('template', defaultId[0].id)
        } else {
          defaultId = (usedTemplateList && usedTemplateList.length > 0) ? usedTemplateList[0].id : ''
          this.setState({
            defaultTemplateId: defaultId
          })
        }

        let tempId = history.id ? history.id : defaultId
        this.setState({
          defaultTemplateId: tempId,
          activeKey: '1'
        })
        this.props.changeActiveRelation && this.props.changeActiveRelation('1')
        // 切换关系模版时，获取当前选中模版得到对应的vertexlist
        let defaultTemp = undefined
        let usedTemplateListTest = usedTemplateList.data ? usedTemplateList.data : usedTemplateList
        defaultTemp = usedTemplateListTest.filter((item) => {
          return item.id === tempId
        })
        // 拿出当前关系模版下的rule，判断出相关联的实体，进行默认勾选
        if (defaultTemp.length > 0) {
          this.selectEntitiesAccordingTemplate(defaultTemp[0].rule)
        }

        this.props.setDefaultTemplate('template', tempId)
      } else {
        // 如果不存在ID的话说明是在关系列表页面切换activekey
        this.setState({
          activeKey: '2'
        }, () => {
          this.checkVertexes()
          this.props.setDefaultTemplate('outV')
          this.props.changeActiveRelation && this.props.changeActiveRelation('2')
        })
        // 切换关系列表时，获取edgelist得到对应的vertexlist
      }
  }
  componentWillMount() {
    const { schemaOptions } = this.props
    this.initAllCheckboxConfig(schemaOptions)
    // const arr1 = ["tv_user", "tv_n_user"]
    // const arr2 = ["te_promotion", "te_contacts", "te_recommend", "te_list", "te_address_dm", "te_email_dm", "te_office_dm", "te_repayment_dm", "te_band_dm", "te_login_dm", "te_wifi_dm", "te_recharge_dm", "te_tel_dm", "te_order_adr_dm", "te_paynbr_dm", "te_classmate_dm", "te_called_dm", "te_repayment_person_dm", "te_persons_acting_in_concert_dm", "te_transfer_dm_v1", "te_order_person_summary", "te_srct_summary", "te_hj_summary", "te_jfcq_summary", "te_jfym_summary"]
    // schemaOptions.OUT_V.forEach(item => arr1.indexOf(item.name) > -1 ? item.checked = true : item.checked = false)
    // schemaOptions.OUT_E.forEach(item => arr2.indexOf(item.name) > -1 ? item.checked = true : item.checked = false)
    schemaOptions.OUT_V && schemaOptions.OUT_V.forEach(item => item.defaultSelected === 'Y' ? item.checked = true : item.checked = false)
    schemaOptions.OUT_E && schemaOptions.OUT_E.forEach(item => item.defaultSelected === 'Y' ? item.checked = true : item.checked = false)

  }
  componentDidMount() {
    let _this = this
    this.props.getUsedTemplate().then(() => {

      if (_this.props.usedTemplateList) {
        let defaultId = undefined;
        defaultId = _this.props.usedTemplateList.filter((item) => {
          if (_this.props.history.id) {
            return _this.props.history.id === item.id
          } else {
            return item.default === true
          }

        })
        if (defaultId.length > 0) {
          _this.setState({
            defaultTemplateId: defaultId[0].id
          })
          _this.props.setDefaultTemplate('template', defaultId[0].id)
        } else {
          let defaultId = (_this.props.usedTemplateList && _this.props.usedTemplateList.length > 0) ? _this.props.usedTemplateList[0].id : ''
          _this.setState({
            defaultTemplateId: defaultId
          })
          _this.props.setDefaultTemplate('template', defaultId)
        }
        let defaultTemp = undefined
        defaultTemp = _this.props.usedTemplateList.filter((item) => {
          return item.id === _this.state.defaultTemplateId
        })
        // 防止出现缺少模板 然后导致的报错问题
        if (!defaultTemp || defaultTemp.length <= 0) {
          return
        }
        // 拿出当前关系模版下的rule，判断出相关联的实体，进行默认勾选
        _this.selectEntitiesAccordingTemplate(defaultTemp[0].rule)
      }

      if (_this.props.history && _this.props.history.activeKey) {
        if (_this.props.history.activeKey+'' === '1' && _this.props.history.id) {
          _this.setHistoryRecord(_this.props.history)
        }
        if (_this.props.history.activeKey+'' === '2') {
          _this.setHistoryRecord(_this.props.history)
        }

      }
    })
  }

  componentWillReceiveProps({ schemaOptions, usedTemplateList, history }) {
    console.log('componentWillReceiveProps')
    console.log(this.props.schemaOptions.OUT_E)
    console.log(schemaOptions.OUT_E)
    if (JSON.stringify(schemaOptions) !== JSON.stringify(this.props.schemaOptions)) {
      this.prevSchemaOptions = { ...this.props.schemaOptions }
      this.initAllCheckboxConfig(schemaOptions)
      // const arr1 = ["tv_user", "tv_n_user"]
      // const arr2 = ["te_promotion", "te_contacts", "te_recommend", "te_list", "te_address_dm", "te_email_dm", "te_office_dm", "te_repayment_dm", "te_band_dm", "te_login_dm", "te_wifi_dm", "te_recharge_dm", "te_tel_dm", "te_order_adr_dm", "te_paynbr_dm", "te_classmate_dm", "te_called_dm", "te_repayment_person_dm", "te_persons_acting_in_concert_dm", "te_transfer_dm_v1", "te_order_person_summary", "te_srct_summary", "te_hj_summary", "te_jfcq_summary", "te_jfym_summary"]
      // schemaOptions.OUT_V.forEach(item => arr1.indexOf(item.name) > -1 ? item.checked = true : item.checked = false)
      // schemaOptions.OUT_E.forEach(item => arr2.indexOf(item.name) > -1 ? item.checked = true : item.checked = false)
      schemaOptions.OUT_V && schemaOptions.OUT_V.forEach(item => item.defaultSelected === 'Y' ? item.checked = true : item.checked = false)
      schemaOptions.OUT_E && schemaOptions.OUT_E.forEach(item => item.defaultSelected === 'Y' ? item.checked = true : item.checked = false)


    }
    if (schemaOptions.OUT_V && schemaOptions.OUT_E) {
      let sOutV = schemaOptions.OUT_V && schemaOptions.OUT_V.filter(item => {
        return !item.checked
      })
      let sOutE = schemaOptions.OUT_E && schemaOptions.OUT_E.filter(item => {
        return !item.checked
      })
      let soutvResult = undefined
      let souteResult = undefined
      if (sOutV && sOutV.length <= 0 && schemaOptions.OUT_V && schemaOptions.OUT_V.length > 0) {
        soutvResult = Object.assign({}, this.state.all_checkbox_control, {
          OUT_V: {
            checked: true,
            checkedNum: schemaOptions.OUT_V.length
          }
        })
      } else {
        soutvResult = Object.assign({}, this.state.all_checkbox_control, {
          OUT_V: {
            checked: false,
            checkedNum: schemaOptions.OUT_V.length - sOutV.length
          }
        })
      }
      if (sOutE && sOutE.length <= 0 && schemaOptions.OUT_E && schemaOptions.OUT_E.length > 0) {
        souteResult = Object.assign({}, soutvResult, {
          OUT_E: {
            checked: true,
            checkedNum: schemaOptions.OUT_E.length
          }
        })
      } else {
        souteResult = Object.assign({}, soutvResult, {
          OUT_E: {
            checked: false,
            checkedNum: schemaOptions.OUT_E.length - sOutE.length
          }
        })

      }
      this.setState({
        all_checkbox_control: souteResult
      })
    }


    if (history && history !== this.props.history) {
      if (this.props.usedTemplateList && this.props.usedTemplateList.length) {
        this.setHistoryRecord(history)
      }

    }

  }

  render() {
    const { vertexesDisabled, all_checkbox_control } = this.state
    const { componentName } = this.props
    const radioStyle = {
      display: 'inline-block',
      height: '30px',
      lineHeight: '30px',
    };


    let permission = []
    let permissionEdge = []
    let permissionVe = []

    if (componentName === '场景探索') {
      permission = ['可视化查询', componentName, '最大联通图', ['实体显示范围', '关系显示范围']]
      permissionEdge = ['可视化查询', componentName, '最大联通图', '关系显示范围']
      permissionVe = ['可视化查询', componentName, '最大联通图', '实体显示范围']
    } else {
      permission = ['可视化查询', componentName, ['实体显示范围', '关系显示范围']]
      permissionEdge = ['可视化查询', componentName, '关系显示范围']
      permissionVe = ['可视化查询', componentName, '实体显示范围']
    }

    return (
      <AuthWrap permission={permission}>
        <TitleDivision title="输出范围" options={this.props.styles}>
          <AuthWrap permission={permissionEdge}>
            <div className='check-all'>
              <div className='check-all-head'>
                <Row>
                  <Col span={6}>关系：</Col>
                  <Col span={6} offset={12}>
                    {
                      this.state.activeKey === '2' && <Checkbox
                        checked={all_checkbox_control.OUT_E.checked}
                        onChange={this.allCheckChangleHandler.bind(this, 'OUT_E')}
                      >
                        全部
                      </Checkbox>
                    }
                  </Col>
                </Row>
              </div>

              <Tabs onChange={this.changeActiveKeyHandler.bind(this)} activeKey={this.state.activeKey} animated={false}>

                <TabPane tab="关系模板" key={'1'}>
                  <Radio.Group
                    onChange={this.selectTemplateHandler.bind(this)}
                    value={this.state.defaultTemplateId} name="radiogroup">
                    <Collapse
                      bordered={false}
                      onChange={this.collapseChangeHandler.bind(this, 3)}
                      className="ant-template-collapse"
                    >
                      <span onClick={this.showModalBoxHandler.bind(this, 'new')} className="add-new-modal">+添加关系模版</span>
                      <div className="ant-template-box">

                        {
                          this.props.usedTemplateList && this.props.usedTemplateList.length > 0 && this.props.usedTemplateList.slice(0, 5).map(item => (
                            <div className="modal-list" key={item.id}>
                              <Radio className="hide-word-ellipsis" style={radioStyle} value={item.id} >{item.name}</Radio>
                              {<span className="add-new-modal add-new-modal-right" onClick={this.showModalBoxHandler.bind(this, item)}>编辑</span>}
                            </div>
                          ))
                        }

                      </div>
                      <Panel showArrow={false} header={this.props.usedTemplateList && this.props.usedTemplateList.length > 5 ? this.state.lHeaderFlag ? <Icon type="caret-up" /> : <Icon type="caret-down" /> : ''} key="1">

                        {
                          this.props.usedTemplateList && this.props.usedTemplateList.length > 0 && this.props.usedTemplateList.slice(5).map(item => (
                            <div className="modal-list" key={item.id}>
                              <Radio className="hide-word-ellipsis" style={radioStyle} value={item.id} >{item.name}</Radio>
                              {item.ifOperate && <span className="add-new-modal add-new-modal-right" onClick={this.showModalBoxHandler.bind(this, item)}>编辑</span>}
                            </div>
                          ))
                        }
                      </Panel>
                    </Collapse>
                  </Radio.Group>
                </TabPane>

                <TabPane tab="关系列表" key={'2'}>

                  <Collapse
                    bordered={false}
                    onChange={this.collapseChangeHandler.bind(this, 2)}
                    className="ant-template-collapse">
                    <div className='check-group'>
                      {
                        this.props.schemaOptions.OUT_E && this.props.schemaOptions.OUT_E.slice(0, 6).map(item => (
                          <div className='checkbox-layout' title={item.text} key={item.value}>
                            <Checkbox
                              key={item.value}
                              checked={item.checked}
                              onChange={this.checkChangeHandler.bind(this, item, 'OUT_E')}
                              title={item.text}
                            >{item.text}</Checkbox>
                          </div>
                        ))
                      }
                    </div>

                    <Panel showArrow={false} header={this.props.schemaOptions.OUT_E && this.props.schemaOptions.OUT_E.length > 6 ? this.state.eHeaderFlag ? <Icon type="caret-up" /> : <Icon type="caret-down" /> : ''} key="1">
                      <div className='check-group check-group-collapse'>
                        {
                          this.props.schemaOptions.OUT_E && this.props.schemaOptions.OUT_E.slice(6).map(item => (
                            <div className='checkbox-layout' title={item.text} key={item.value}>
                              <Checkbox
                                key={item.value}
                                checked={item.checked}
                                onChange={this.checkChangeHandler.bind(this, item, 'OUT_E')}
                              >{item.text}</Checkbox>
                            </div>

                          ))
                        }
                      </div>
                    </Panel>
                  </Collapse>
                </TabPane>
              </Tabs>
            </div>
          </AuthWrap>
          <AuthWrap permission={permissionVe}>
            <div className='check-all'>
              <div className='check-all-head'>
                <Row>
                  <Col span={6}>实体：</Col>
                  <Col span={6} offset={12}>
                    <Checkbox
                      checked={all_checkbox_control.OUT_V.checked}
                      onChange={this.allCheckChangleHandler.bind(this, 'OUT_V')}
                    >
                      全部
                    </Checkbox>
                  </Col>
                </Row>
              </div>
              <Collapse bordered={false} onChange={this.collapseChangeHandler.bind(this, 1)}>
                <div className='check-group'>
                  {
                    this.props.schemaOptions.OUT_V && this.props.schemaOptions.OUT_V.slice(0, 6).map(item => (
                      <div className={`checkbox-layout ` + (all_checkbox_control.OUT_V.defaultCheckList && all_checkbox_control.OUT_V.defaultCheckList.indexOf(item.name) !== -1 ? 'related-wrapper' : '')} title={item.text} key={item.value}>
                        <Checkbox
                          key={item.value}
                          checked={item.checked}
                          onChange={this.checkChangeHandler.bind(this, item, 'OUT_V')}
                        >{item.text}</Checkbox>
                      </div>

                    ))
                  }
                </div>
                <Panel showArrow={false} header={this.props.schemaOptions.OUT_V && this.props.schemaOptions.OUT_V.length > 6 ? this.state.vHeaderFlag ? <Icon type="caret-up" /> : <Icon type="caret-down" /> : ''} key="1">
                  <div className='check-group check-group-collapse'>
                    {
                      this.props.schemaOptions.OUT_V && this.props.schemaOptions.OUT_V.slice(6).map(item => (
                        <div className={`checkbox-layout ` + (all_checkbox_control.OUT_V.defaultCheckList && all_checkbox_control.OUT_V.defaultCheckList.indexOf(item.name) !== -1 ? 'related-wrapper' : '')} title={item.text} key={item.value}>
                          <Checkbox
                            key={item.value}
                            checked={item.checked}
                            onChange={this.checkChangeHandler.bind(this, item, 'OUT_V')}
                          >{item.text}</Checkbox>
                        </div>

                      ))
                    }
                  </div>
                </Panel>

              </Collapse>
            </div>
          </AuthWrap>

        </TitleDivision>
        <RelationalTemplate
          hideModal={this.hideModalBoxHandler.bind(this)}
          currentRule={this.state.currentRule}
          isDuplicateName={this.props.templateIsDuplicateName}
          getIsDuplicateName={this.props.getTemplateIsDuplicateName.bind(this)}
          searchHandler={this.props.getUsedTemplate.bind(this)}
        ></RelationalTemplate>
      </AuthWrap>
    )
  }
}

export default DisplaySchemaRange
