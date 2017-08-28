import * as React from 'react';
import { UserQuery } from '../../graphql/user';
import { graphql, compose, withApollo } from 'react-apollo';
import Profile from './';
import { Article, PublicUserInfo } from './shared.interfaces';

import { getJWT } from '../../components/jwt';

interface Props {
    data: {
        users: {
            articles: Article[];
        } & PublicUserInfo
    };
    client: {
        query: ( params: { query: typeof UserQuery, variables: { profileLink: string; } } ) => Promise<Props>;
    };
}

interface State {
    articles: Article[];
    user: PublicUserInfo;
}

class ProfileContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.state = {
            user: {} as PublicUserInfo,
            articles: [] as Article[]
        };

    }

    async componentWillMount() {

        const path = window.location.pathname.split('/');

        const { data } = await this.props.client.query({
            query: UserQuery,
            variables: {
                profileLink: path[path.length - 1]
            }
        });

        this.setState({
            user: data.users[0],
            articles: data.users[0].articles
        });
    }

    render() {

        if (!this.state.user) {
            return null;
        }

        const articles = this.state.articles as Article[];
        const user = this.state.user as PublicUserInfo;
        const canModify = getJWT().profileLink === user.profileLink;

        return (
            <Profile
                articles={articles}
                user={user}
                canModify={canModify}
            />
        );
    }
}




const ProfileContainerWithData = compose(
    graphql(UserQuery, {
        options: {
            variables: {
                profileLink: window.location.pathname.split('/')[window.location.pathname.split('/').length - 1]
            }
        }
    } as any) as any
)(ProfileContainer);

export default withApollo(ProfileContainerWithData);