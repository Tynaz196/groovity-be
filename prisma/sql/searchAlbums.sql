-- @param {String} $1:query
-- @param {Int} $2:limit
-- @param {Int} $3:offset
-- @param {String} $4:loginUserId


SELECT id
FROM albums
WHERE is_public = true or user_id = $4
ORDER BY strict_word_similarity(name, $1) DESC
LIMIT $2
OFFSET $3;