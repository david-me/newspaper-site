import * as React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import { MissionEdit, MissionQuery } from '../../graphql/mission';
import graphqlErrorNotifier from '../../helpers/graphqlErrorNotifier';

import Mission from './';
import { FocusEvent } from 'react';

export interface Props {
    editMission: (params: { query: typeof MissionEdit, variables: { mission: string } }) => Promise<{
        data: {
            editMission: {
                mission: string
            }
        }
    }>;
    data: {
        mission: {
            mission: string;
            canEdit: boolean;
        }
    };
}

interface State {
    content: string;
}

export class MissionContainer extends React.Component<Props, State> {

    public state: State;

    constructor(props: Props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            content: ''
        };
    }

    /**
     * Gets mission statement
     */
    async componentWillReceiveProps(props: Props) {

        if (props.data.mission.mission) {

            this.setState({
                content: props.data.mission.mission
            });
        }
    }

    /**
     * Sends updates mission to server
     */
    onSubmit() {

        graphqlErrorNotifier(
            this.props.editMission,
            {
                query: MissionEdit,
                variables: {
                    mission: this.state.content
                }
            },
            'missionUpdated'
        );
    }

    render() {

        if (!this.state.content) {
            return null;
        }

        return (
            <Mission
                content={this.state.content}
                onSubmit={this.onSubmit}
                onSave={(e: FocusEvent<HTMLDivElement>) =>
                    this.setState({ content: (e.target as HTMLElement).innerHTML })}
                canEdit={this.props.data.mission.canEdit}
            />
        );
    }
}

const MissionContainerWithData = compose(
    graphql(MissionEdit, {name: 'editMission'}),
    graphql(MissionQuery),
)(MissionContainer);

export default withApollo(MissionContainerWithData as any) as any;
