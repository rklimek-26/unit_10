//import statements
import React from 'react';

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import Header from './components/Header';

import NotFound from './components/NotFound';
import Forbidden from './components/Forbidden';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SignOut from './components/SignOut';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import CreateCourse from './components/CreateCourse';
import UpdateCourse from './components/UpdateCourse';
import withContext from './Context';
import PrivateRoute from './PrivateRoute';
import Authenticated from './components/Authenticated';

//set variables
const HeaderWithContext = withContext(Header);
const AuthWithContext = withContext(Authenticated);
const SignUpWithContext = withContext(SignUp);
const SignInWithContext = withContext(SignIn);
const SignOutWithContext = withContext(SignOut);
const CoursesWithContext = withContext(Courses);
const CourseDetailWithContext = withContext(CourseDetail);
const CreateCourseWithContext = withContext(CreateCourse);
const UpdateCourseWithContext = withContext(UpdateCourse);


export default () => (
  <Router>
    <HeaderWithContext />
      <div>
        <Switch>
          <Route exact path="/" component={CoursesWithContext} />
          <PrivateRoute path="/authenticated" component={AuthWithContext} />
          <Route path="/signin" component={SignInWithContext} />
          <Route path="/signup" component={SignUpWithContext} />
          <Route path ="/signout" component={SignOutWithContext} />
          
          <PrivateRoute path="/courses/create" component ={CreateCourseWithContext}/>
          <PrivateRoute path="/courses/:id/update" component={UpdateCourseWithContext}/>
          <Route path="/courses/:id" component={CourseDetailWithContext} />
          <Route path="/notfound" component={NotFound} />
          <Route path="/forbidden" component={Forbidden} />
          <Route component={NotFound} />
          
          </Switch>
        </div>
      </Router>
);