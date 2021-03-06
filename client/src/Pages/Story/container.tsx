import * as React from 'react';

import { compose, graphql, withApollo } from 'react-apollo';
import { ArticleQuery } from '../../graphql/article';
import { EditArticle } from '../../graphql/articles';
import graphqlErrorNotifier from '../../helpers/graphqlErrorNotifier';
import { ArticleInfo, Story } from './shared.interfaces';
import StoryComponent from './';
import { FocusEvent } from 'react';

interface Props {

    client: {
        query: ( params: {
            query: typeof ArticleQuery, variables: { issue: number; url: string }
        } ) => Promise<{data: { articles: Story[] } }>;
    };
    editArticle: ( params: {
        variables: {
            id: string;
            article: string;
        }
    }) => void; // not really void
}

type State = ArticleInfo & { originalArticle: string };

export class StoryContainer extends React.Component<Props, State> {

    public state: State;

    constructor(props: Props) {
        super(props);

        this.state = {} as State;

        this.onSaveEdits = this.onSaveEdits.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

    }

    /**
     * Saves e.target.innerHTML to this.state[indexToChange]
     */
    onSaveEdits(indexToChange: string, e: FocusEvent<HTMLElement>) {

        const newState = {};
        newState[indexToChange] = (e.target as HTMLElement).innerHTML;

        this.setState(newState);
    }

    /**
     * Gets article from server and sets the state to the data received
     */
    async componentWillMount() {

        const path = window.location.pathname.split('/');
        const issue = +path[2];
        const url = decodeURIComponent(path[4]);

        const { data } = await this.props.client.query({
            query: ArticleQuery,
            variables: {
                issue,
                url
            }
        });

        const article = data.articles[0];

        const heading = article.article.match(/^[\s\S]+?<\/h4>/)![0];
        const body = article.article.replace(heading, '');

        this.setState({
            originalArticle: article.article,
            issue,
            url,
            heading,
            body,
            canEdit: article.canEdit,
            comments: article.comments || [],
            tags: article.tags,
            id: article.id
        });
    }

    /**
     * Sends edited article to server
     */
    onSubmit() {

        const article = this.state.heading + this.state.body;

        if (this.state.originalArticle === article) {
            return;
        }

        graphqlErrorNotifier(
            this.props.editArticle,
            {
                variables: {
                    id: this.state.id,
                    article
                }
            },
            'articleEdited'
        );
    }

    render() {

        if (!this.state.id) {
            return null;
        }

        return (
           <StoryComponent
              {...this.state}
              onSaveEdits={this.onSaveEdits}
              onSubmit={this.onSubmit}
           />
        );
    }
}

const StoryContainerWithData = compose(
    graphql(EditArticle, {name: 'editArticle'}),
)(StoryContainer);

export default withApollo(StoryContainerWithData as any) as any;
