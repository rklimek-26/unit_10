//stateless functional component
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = ({ context }) => {
    const authUser = context.authenticatedUser;
    
    return (
        <React.Fragment>
            <div>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no"
                />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link
                    href="https://fonts.googleapis.com/css?family=Work+Sans:400,500"
                    rel="stylesheet"
                    type="text/css"
                />
                <link
                    href="https://fonts.googleapis.com/css?family=Cousine"
                    rel="stylesheet"
                    type="text/css"
                />
                <link href="../styles/global.css" rel="stylesheet" />
                <title>Courses</title>
            </div>
            <div className="header">
                <div className="bounds">
                <NavLink className="header--logo" to="/">Courses</NavLink>
                <nav>
                    {authUser ? (
                        <React.Fragment>
                            <span>Welcome, {`${authUser.firstName}  ${authUser.lastName}`}! </span>
                            <NavLink className="signout" to="/signout">Sign Out</NavLink>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <NavLink className="signup" to="/signup">Sign Up</NavLink>
                            <NavLink className="signin" to="/signin">Sign In</NavLink>
                        </React.Fragment>
                    )}
                </nav>
                </div>
            </div>
            <hr />
        </React.Fragment>
    );
}

export default Header;