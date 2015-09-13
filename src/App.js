import React from 'react';
import ApiClient from './helpers/ApiClient';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: this.props.count
    };

    this.handleClick = this.handleClick.bind(this);

    this.client = new ApiClient();
  }

  handleClick() {
    this.client.get('/plusone').then((data) => {
      this.setState({
        count: data
      });
    });
  }

  render() {
    return (
        <div>
          <span>Hallo Welt!!! Du hast dich schon {this.state.count} mal gedreht für mich :-).</span>
          -
          <button onClick={this.handleClick}>+1</button>
        </div>
    );
  }
}

export default App;
