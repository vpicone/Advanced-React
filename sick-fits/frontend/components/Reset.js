import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

const RESET_MUTATION = gql`
  mutation SIGNIN_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      name
      email
    }
  }
`;

export default class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired,
  };
  state = {
    password: '',
    confirmPassword: '',
  };

  saveToState = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    const { password, confirmPassword } = this.state;
    const { resetToken } = this.props;
    return (
      <Mutation mutation={RESET_MUTATION} variables={{ resetToken, password, confirmPassword }}>
        {(reset, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                await reset();
                this.setState({ password: '', confirmPassword: '' });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Reset your password</h2>
                <ErrorMessage error={error} />
                {!error && !loading && called && <p>Your password has been successfully reset!</p>}
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="confirmPassword">
                  Confirm Password
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="confirm password"
                    value={this.state.confirmPassword}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Reset</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
