import React, { Component} from 'react';
import Form from './Form';

class CreateCourse extends Component {
  state = {
    title: '',
    description: '',
    estimatedTime: '',
    materialsNeeded: '',
    userId: null,
    errors: []
  }
  
  render(){
    const{
      title,
      description,
      estimatedTime,
      materialsNeeded,
      errors,
    } = this.state;
    const {context} = this.props;
    const author = `${context.authenticatedUser.firstName} ${context.authenticatedUser.lastName}`;
    return (
    
        <div className="bounds course--detail">
          <h1>Create Course</h1>
            <Form 
              cancel={this.cancel}
              errors={errors}
              submit={this.submit}
              submitButtonText="Create Course"
              elements={() => (
                <React.Fragment>
                  <div className="grid-66">
                    <div className="course--header">
                    <h4 className="course--label">Course</h4>
                    <input 
                      id="title"
                      name="title"
                      type="text"
                      value={title}
                      onChange={this.change}
                      placeholder="Course title..." />
                      <p>By {author} </p>
                  </div>
                  <div className="course--description">
                    <textarea 
                        id="description"
                        name="description"
                        className="desc"
                        value={description}
                        onChange={this.change}
                        placeholder="Course description..." />
                    </div>
                </div>
                  <div className="grid-25 grid-right">
                  <div className="course--stats">
                    <ul className="course--stats--list">
                      <li className="course--stats--list--item">
                      <h4>Estimated Time</h4>
                    <React.Fragment>
                     <input 
                        id="estimatedTime"
                        name="estimatedTime"
                        type="text"
                        className="course--time--input"
                        value={estimatedTime}
                        onChange={this.change}
                        placeholder="Hours" />
                    </React.Fragment>
                     </li>
                     <li className="course--stats--list--item">
                      <h4>Materials Needed</h4>
                      <React.Fragment>
                      <textarea 
                        id="materialsNeeded"
                        name="materialsNeeded"
                        className="materials"
                        value={materialsNeeded}
                        onChange={this.change}
                        placeholder="List materials..." />
                       </React.Fragment>
                      </li>
                    </ul>
                  </div>
                </div>   
              </React.Fragment> 
            )} />
            </div>
                 
        );
    }
    change = (event) =>{
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
     
      const {title, description, estimatedTime, materialsNeeded} = this.state;
      //new course essentials 
      const createCourse={
        title,
        description,
        estimatedTime,
        materialsNeeded,
        userId: context.authenticatedUser.id
      } 
      //get the users emailAddress and password before they can create a course
      const emailAddress = context.authenticatedUser.emailAddress;
      const password = context.authenticatedUser.password;
      //create new course, use the catch statement to redirect to error page if something goes wrong
      context.data.createCourse(createCourse, emailAddress, password)
          .then(errors =>{
            console.log(errors);
            if(errors.length === 1 || errors.length === 2){
              this.setState( ()=>{
                return {errors}
            });
            }else{
                this.props.history.push('/');
                console.log(`SUCCESS! ${emailAddress} has just created the course ${createCourse}!`);
              }
          })
          
          .catch(err => {
            console.log(err);
            this.props.history.push('/error');
          });
      }
      cancel = () =>{
        this.props.history.push('/');
      }
}

export default CreateCourse;