import React, { Component } from 'react'
import styles from './index.less'
import PropTypes from 'prop-types'
import { classRoom, classCourse } from '$routes/School'
import { Link } from 'react-router-dom'

export default class SchoolNav extends Component {
    static propTypes = {
        schoolObj: PropTypes.object.isRequired,
        classObj: PropTypes.object,
        courseObj: PropTypes.object
    }
    static defaultProps = {

    }

    render() {
        const { schoolObj, classObj, courseObj } = this.props
        return (
            <div className={styles.navWp}>
                <div className={styles.schoolNav}>
                    <Link to={classRoom.fill({ schoolId: schoolObj.id })}>{schoolObj.name}</Link>
                    {/* <Link to={classRoom.fill({ schoolId: schoolObj.id })}>{schoolObj.name}美科教室</Link> */}
                    {classObj &&
                    <Link to={classCourse.fill({ schoolId: schoolObj.id, class: classObj.id })}>{classObj.name}</Link>}
                    {courseObj &&
                    <a href={'#'}><span>{courseObj.name}</span></a>}
                </div>
            </div>
        )
    }
}
