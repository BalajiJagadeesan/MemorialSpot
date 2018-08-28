import React, { Component } from "react";

class Error extends Component {
  render() {
    const { errors } = this.props;
    return (
      <div>
        {errors.map((error, index) => {
          return (<p key={index}>{error.name} : {error.details}</p>);
        })
        }
      </div>
    );
  }
}

export default Error;
