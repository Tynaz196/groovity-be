-- @param {String} $1:query
-- @param {Int} $2:limit
-- @param {Int} $3:offset


SELECT user_id
FROM user_profiles
ORDER BY strict_word_similarity(name, $1) DESC
LIMIT $2
OFFSET $3;