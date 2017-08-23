import * as React from 'react';
import { UserArticleTableContainer } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../../tests/localstorage.mock';
import casual from '../../../tests/casual.data';
import snapData from './articles.example';
import { Article } from '../shared.interfaces';
import { randomCheckboxToggle } from '../../../tests/enzyme.helpers';
import toggler from '../../../helpers/toggler';

localStorageMock.setItem('jwt', JSON.stringify([,{level: 3}]));

interface CustomCasualData {
    articles: (amount: number) => Article[];
}

type customCasual = CustomCasualData & typeof casual;

const customCasual = casual as customCasual;

casual.define('articles', function(amount: number) {

    const articles: Article[] = [];

    while (amount-- > 0) {

        articles.push({
            tags: casual.tags,
            url: casual.articleUrl,
            id: casual.word + '--' + amount,
            dateCreated: casual.dateCreated,
            views: casual.randomPositive,
            issue: casual.randomPositive
        });
    }

    return articles;
});

const data = {
    articles: customCasual.articles(casual.randomPositive)
};

function setup(mockGraphql: {deleteArticle?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <UserArticleTableContainer
                articles={data.articles}
                deleteArticle={mockGraphql.deleteArticle ? mockGraphql.deleteArticle : (test: {}) => false}
                canModify={true}
            />
        </MemoryRouter>
    );
}

describe('<UserArticleTableContainer>', () => {

    describe('snapshots', () => {

        function testSnap(canModify: boolean) {

            const tree = renderer.create(

                <MemoryRouter>
                    <UserArticleTableContainer
                        articles={snapData}
                        deleteArticle={(test: {}) => false}
                        canModify={canModify}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly when canModify is true', () => testSnap(true));

        it('renders correctly when canModify is false', () => testSnap(false));
    });

    describe('onDelete', () => {

        let wrapper: any;
        let component: any;
        let deleteBoxes: any;

        beforeEach(() => {

            wrapper = setup();

            deleteBoxes = wrapper.find('[name="delArt"]');
            component = wrapper.find(UserArticleTableContainer).node;
        });

        it('adds article id to state.idsToDelete when checkbox is clicked', () => {

            let expectedIds = new Set<string>();
            let articlesToTest = casual.integer(0, deleteBoxes.length - 1);

            for (let i = 0; expectedIds.size < articlesToTest; i++) {

                const result = randomCheckboxToggle(deleteBoxes);

                toggler(expectedIds, component.props.articles[result.index].id);
            }

            expect([...component.state.idsToDelete]).toEqual([...expectedIds]);
        });

        it('removes article id from state.idsToDelete when checkbox is unchecked', () => {

            let expectedIds = new Set<string>();
            let indices = new Set<String>();
            let articlesToTest = casual.integer(0, deleteBoxes.length - 1);

            for (let i = 0; expectedIds.size < articlesToTest; i++) {

                const result = randomCheckboxToggle(deleteBoxes);
                const id = result.input.nodes[0].value;

                toggler(expectedIds, id);
                toggler(indices, result.index);
            }

            for (let i = 0; i < casual.integer(0, indices.size); i++) {

                const indexToRemove = casual.random_element([...indices]);

                const result = randomCheckboxToggle(deleteBoxes, indexToRemove);
                indices.delete(indexToRemove);

                expectedIds.delete(result.input.nodes[0].value);
            }

            expect([...component.state.idsToDelete].sort()).toEqual([...expectedIds].sort());
        });
    });
});