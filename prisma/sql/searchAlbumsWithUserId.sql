-- @param {String} $1:query
-- @param {Int} $2:limit
-- @param {Int} $3:offset
-- @param {String} $4:searchUserId
-- @param {String} $5:loginUserId

SELECT id
FROM albums
WHERE user_id = $4 and (is_public = true or $4 = $5)
ORDER BY strict_word_similarity(name, $1) DESC
LIMIT $2
OFFSET $3;