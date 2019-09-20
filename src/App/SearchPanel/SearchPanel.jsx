import React from 'react';
import ReactGA from 'react-ga';
import SearchTable from './SearchTable';

export default class SearchPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			aCompletelyNormalCounter: 0,
		};
	}

	render() {
		return (
			<div className="SearchPanel">
				<SearchTable
					{...this.props}
					isEggState={this.isEggState}
					onEggClicked={this.onEggClicked}
				/>
			</div>
		);
	}

	isEggState = () => this.state.aCompletelyNormalCounter >= 10;
	onEggClicked = () => {
		this.setState((prevState) => {
			let newCounter = prevState.aCompletelyNormalCounter + 1;
			gaEgg(newCounter);
			return {
				aCompletelyNormalCounter: newCounter,	// You found me :)
			};
		});
	};
}

function gaEgg(newCounter) {
	if (newCounter === 1) {
		ReactGA.event({
			category: 'EasterEgg',
			action: 'FirstClicked',
		});
	} else if (newCounter === 10) {
		ReactGA.event({
			category: 'EasterEgg',
			action: 'Found',
		});
	}
}
