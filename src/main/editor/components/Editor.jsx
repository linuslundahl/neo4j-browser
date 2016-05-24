import React from 'react'
import { connect } from 'react-redux'
import editor from '../'
import { getHistory, getEditorContent } from '../../../selectors'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/cypher/cypher'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

export class EditorComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      code: '',
      historyIndex: -1,
      buffer: null
    }
  }
  handleEnter (cm) {
    if (cm.lineCount() === 1) {
      return this.execCurrent(cm)
    }
    this.newlineAndIndent(cm)
  }
  newlineAndIndent (cm) {
    this.codeMirrorInstance.commands.newlineAndIndent(cm)
  }
  execCurrent (cm) {
    this.props.onExecute(cm.getValue())
    this.setEditorValue(cm, '')
    this.setState({historyIndex: -1, buffer: null})
  }
  historyPrev (cm) {
    if (!this.props.history.length) return
    if (this.state.historyIndex + 1 === this.props.history.length) return
    if (this.state.historyIndex === -1) { // Save what's currently in the editor
      this.setState({buffer: cm.getValue()})
    }
    this.setState({historyIndex: this.state.historyIndex + 1})
    this.setEditorValue(cm, this.props.history[this.state.historyIndex].cmd)
  }
  historyNext (cm) {
    if (!this.props.history.length) return
    if (this.state.historyIndex <= -1) return
    if (this.state.historyIndex === 0) { // Should read from buffer
      this.setState({historyIndex: -1})
      this.setEditorValue(cm, this.state.buffer)
      return
    }
    this.setState({historyIndex: this.state.historyIndex - 1})
    this.setEditorValue(cm, this.props.history[this.state.historyIndex].cmd)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.content !== this.state.code) {
      this.setState({ code: nextProps.content })
    }
  }
  componentDidMount () {
    this.codeMirror = this.refs.editor.getCodeMirror()
    this.codeMirrorInstance = this.refs.editor.getCodeMirrorInstance()
    this.codeMirrorInstance.keyMap['default']['Enter'] = this.handleEnter.bind(this)
    this.codeMirrorInstance.keyMap['default']['Shift-Enter'] = this.newlineAndIndent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Enter'] = this.execCurrent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Enter'] = this.execCurrent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Up'] = this.historyPrev.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Up'] = this.historyPrev.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Down'] = this.historyNext.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Down'] = this.historyNext.bind(this)
  }
  setEditorValue (cm, cmd) {
    cm.setValue(cmd)
    this.updateCode(cmd)
  }
  updateCode (newCode) {
    this.setState({
      code: newCode
    })
    this.props.updateContent(newCode)
  }
  render () {
    const options = {
      lineNumbers: true,
      mode: 'cypher',
      theme: 'neo',
      gutters: ['cypher-hints'],
      lineWrapping: true,
      autofocus: true
    }
    return (
      <div id='editor'>
        <Codemirror
          ref='editor'
          value={this.state.code}
          onChange={this.updateCode.bind(this)}
          options={options}
        />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onExecute: (cmd) => {
      dispatch(editor.actions.executeCommand(cmd))
    },
    updateContent: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const mapStateToProps = (state) => {
  return {
    content: getEditorContent(state),
    history: getHistory(state)
  }
}

export const Editor = connect(mapStateToProps, mapDispatchToProps)(EditorComponent)