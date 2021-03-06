<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once(__DIR__ . '/user.php');
require_once(__DIR__ . '/image.php');
require_once(__DIR__ . '/comment.php');
require_once(__DIR__ . '/../fields/queries/users.php');


use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\Scalar\IntType;

use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\ListType\ListType;

class ArticleType extends AbstractObjectType {

    public function build($config) {

        $config->addFields([
            'id' => new NonNullType(new IdType()),
            'dateCreated' => new StringType(),
            'lede' => new NonNullType(new StringType()),
            'body' => new StringType(),
            'url' => new NonNullType(new StringType()),
            'article' => [
                'type' => new NonNullType(new StringType()),
                'resolve' => function ($article) {

                    $content = $article['lede'] . $article['body'];

                    $images = Db::Query("SELECT url FROM images WHERE art_id = ?", [$article['id']])->fetchAll(PDO::FETCH_COLUMN, 0);

                    foreach ($images as $image) {

                        $imagePos = strpos($content, 'data-src');

                        if ($imagePos !== false) {
                            $content = substr_replace($content, "src='{$image}'", $imagePos, strlen('data-src'));
                        }
                    }
                    (new ArticleHelper())->addView($article);

                    return $content;
                }
            ],
            'issue' => [
                'type' => new NonNullType(new IntType()),
                'resolve' => function ($article) {
                    return +$article['issue'];
                }
            ],
            'views' => [
                'type' => new NonNullType(new IntType()),
                'resolve' => function (array $article) {
                    return +$article['views'];
                }
            ],
            'displayOrder' => [
                'type' => new NonNullType(new IntType()),
                'resolve' => function (array $article) {
                    return +$article['displayOrder'];
                }
            ],
            'tags' => [
                'type' => new NonNullType(new ListType(new StringType())),
                'resolve' => function ($article) {
                    return Db::Query("SELECT tag FROM tags WHERE art_id = ?", [$article['id']])->fetchAll(PDO::FETCH_COLUMN, 0);
                }
            ],
            'authorId' => new NonNullType(new IdType()),
            'author' => [
                'type' => new NonNullType(new UserType()),
                'resolve' => function ($article) {

                    return (new UsersField())->getUsers(['id' => $article['authorId']])[0];
                }
            ],
            'comments' => [
                'type' => new NonNullType(new ListType(new CommentType)), // CommentType
                'resolve' => function ($article) {

                    return (new CommentsField())->getComments(['artId' => $article['id'] ]);
                }
            ],
            'images' => [
                'type' => new NonNullType(new ListType(new ImageType())),
                'args' => [
                    'slide' => new BooleanType()
                ],
                'resolve' => function ($article, array $args) {

                    $sql = "SELECT id, slide, art_id, url FROM images WHERE art_id = ?";

                    if (isset($args['slide'])) {
                        return Db::Query("{$sql} AND slide = ?", [$article['id'], +$args['slide']])->fetchAll(PDO::FETCH_ASSOC);
                    }

                    return Db::Query($sql, [$article['id']])->fetchAll(PDO::FETCH_ASSOC);
                }
            ],
            'canEdit' => [
                'type' => new NonNullType(new BooleanType()),
                'resolve' => function ($article) {
                    return !!$article['canEdit'];
                }
            ]
        ]);
    }
}
