import React, { Component } from 'react';
import Form from './Form';

class UpdateCourse extends Component {
    //setting up state
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            title: '',
            description: '',
            estimatedTime: '',
            materialsNeeded: '',
            userId: null,
            errors: []
        }
    }

    componentDidMount() {
        //getting the existing course data
        const { context } = this.props;
        const courseId = this.props.match.params.id;
        const authUserId = context.authenticatedUser.id;

        context.data.getCourse(courseId)
        .then(course => {
            const courseOwnerId = course.userId
            if (course) {
                if (courseOwnerId === authUserId) {
                    this.setState({
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        estimatedTime: course.estimatedTime,
                        materialsNeeded: course.materialsNeeded,
                        userId: course.userId
                    });
                } else {
                    this.props.history.push('/forbidden');
                }
            } else {
                this.props.history.push('/notfound');
            }
        })
        .catch(err => {
            console.log('Something went wrong: ', err);
            this.props.history.push('/error'); 
        });
    }
    render(){
        const{
            
            title,
            description,
            estimatedTime,
            materialsNeeded,
            firstName,
            lastName,
            errors
        } = this.state;

       
        return (
            <div className="bounds course--detail">
                <h1>Update Course</h1>
                <Form 
                  cancel={this.cancel}
                  errors={errors}
                  submit={this.submit}
                  submitButtonText="Update Course"
                  elements={() => (
                    <React.Fragment>
                      <div className="grid-66">
                        <div className="course-header">
                          <h4 className="course--label">Course</h4>
                          <div>
                            <input id="title" name="title" type="text" className="input-title course--title-input" value={title} onChange={this.change} />
                          </div>
                          <p>By {firstName} {lastName}</p>
                        </div>
                        <div className="course--description">
                          <div>
                            <textarea id="description" name="description" className="" placeholder={description} value={description} onChange={this.change} />
                          </div>
                        </div>
                      </div>
                      <div className="grid-25 grid-right">
                        <div className="course--stats">
                          <ul className="course--stats--list">
                            <li className="course--stats--list--item">
                              <h4>Estimated Time</h4>
                              <div>
                                <input id="estimatedTime" name="estimatedTime" type="text" className="course--time--input" value={ estimatedTime ? estimatedTime: ''} onChange={this.change} />
                              </div>
                            </li>
                            <li className="course--stats--list--item">
                              <h4>Materials Needed</h4>
                              <div>
                                <textarea id="materialsNeeded" name="materialsNeeded" className="" value={materialsNeeded ? materialsNeeded : ''} onChange={this.change}/> 
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                    </React.Fragment>
                  )} />
              </div>
            
          );
        } 
        change =(event) => {
          const name = event.target.name;
          const value = event.target.value;

          this.setState(() =>{
              return {
                  [name]: value
              };
          });
      }
        submit = () => {
            const { context } = this.props;
        
            const {
              id,
              title,
              description,
              estimatedTime,
              materialsNeeded,
              
             
            } = this.state;
        
            //New course payload
            const updateCourse ={
              id,
              title,
              description,
              estimatedTime,
              materialsNeeded,
              userId: context.authenticatedUser.id
            }
            const emailAddress = context.authenticatedUser.emailAddress;
            const password = context.authenticatedUser.password;

            context.data.updateCourse(updateCourse, emailAddress, password)
              .then(errors =>{
                console.log(errors.errors);
                if(errors.errors){
                  this.setState( () =>{
                    return {errors:[errors.errors]}
                  }); 
                }
                else{
                    console.log(`Course : ${updateCourse.id} has being successfully updated`);
                    this.props.history.push(`/courses/${updateCourse.id}`);
                
                }
              })
              .catch( err => {
                console.log(err);
                this.props.history.push('/error') // push to history stack
              })
          }
        
          cancel = () => {
            this.props.history.push(`/courses/${this.state.id}`);
        
          }
}
export default UpdateCourse;