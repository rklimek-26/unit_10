import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';


class CourseDetail extends Component {

    //set up constructor
    constructor(props){
        super(props);
        this.state ={
            courseDetail:[],


        }
    }
    //set up component
  componentDidMount() {
    const { context } = this.props;
    const { id } = this.props.match.params;
    context.data.getCourse(id)

      .then(course => {
       if(course){
           console.log(course);
        this.setState({
            courseDetail: course,

        });
       }else {
           this.props.history.push('/notfound');
       }
    })
       .catch(err => {
        console.log(err);
        this.props.history.push('/error');
      });
  }

  //Remove course from DB if "Delete" button is clicked
  onDelete = event => {

    if (window.confirm('Please confirm you would like to delete this course. This action cannot be undone!')) {
        console.log('Delete Confirmed')

        const { id } = this.props.match.params;
        const { context } = this.props;
        const emailAddress = context.authenticatedUser.emailAddress;
        const password = context.authenticatedUser.password


        context.data.deleteCourse(id, emailAddress, password)
        .then(() => {

            this.props.history.push('/');
        })
        .catch(err => {
            console.log('Something went wrong: ', err);
            this.props.history.push('/error');
        });
    } else {
        console.log('Delete Canceled');
    }
}

render() {
    const { context } = this.props;
    const authUser = context.authenticatedUser;
    const { id, title, description, estimatedTime, materialsNeeded, userId, userName} = this.state.courseDetail;
    const author = userName ? `${userName.firstName} ${userName.lastName}`: null;


    return (
        <Fragment>
            <div>
                <div className="actions--bar">
                {
                    (() => {
                        if (authUser) {
                            const authUserId = context.authenticatedUser.id;
                            if (authUserId === userId) {
                                return (
                                    <Fragment>
                                        <div className="bounds">
                                            <div className="grid-100">
                                            <span>
                                                <Link className="button" to={`/courses/${id}/update`}>
                                                Update Course
                                                </Link>
                                                <button onClick={this.onDelete} className="button">
                                                Delete Course
                                                </button>
                                            </span>
                                            <Link className="button button-secondary" to="/">
                                                Return to List
                                            </Link>
                                            </div>
                                        </div>
                                    </Fragment>
                                );
                            } else {
                                return (
                                    <Fragment>
                                        <div className="bounds">
                                            <div className="grid-100">

                                            <Link className="button button-secondary" to="/">
                                                Return to List
                                            </Link>
                                            </div>
                                        </div>
                                    </Fragment>
                                );
                            }
                        } else {
                            return (
                                    <Fragment>
                                        <div className="bounds">
                                            <div className="grid-100">

                                            <Link className="button button-secondary" to="/">
                                                Return to List
                                            </Link>
                                            </div>
                                        </div>
                                    </Fragment>
                                );
                        }
                    })()
                }
                </div>
                <div className="bounds course--detail">
                <div className="grid-66">
                    <div className="course--header">
                    <h4 className="course--label">Course</h4>
                    <h3 className="course--title">{title}</h3>
                    <p>By {author} </p>
                    </div>
                    <div className="course--description">
                    <div>
                        <ReactMarkdown source={description} />
                    </div>
                    </div>
                </div>
                <div className="grid-25 grid-right">
                    <div className="course--stats">
                    <ul className="course--stats--list">
                        <li className="course--stats--list--item">
                        <h4>Estimated Time</h4>
                        <h3>{estimatedTime}</h3>
                        </li>
                        <li className="course--stats--list--item">
                        <h4>Materials Needed</h4>
                        <ul>
                            <ReactMarkdown source={materialsNeeded} />
                        </ul>
                        </li>
                    </ul>
                    </div>
                </div>
                </div>
            </div>
        </Fragment>
    );
}
}

export default CourseDetail;
