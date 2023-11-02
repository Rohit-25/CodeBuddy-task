const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.limit) || 10
  try {
    //TODO: Implement this API
    //Find all users with their post count using aggregation framework
    const usersWithPostCount = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: { $size: '$posts' },
        },
      },

    ]).skip((page - 1) * perPage)
      .limit(perPage)




    // Calculate the total number of documents in the "user" collection
    const totalDocs = await User.countDocuments();

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalDocs / perPage);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const pagingCounter = (perPage * (page - 1)) + 1;
    const prevPage = page > 1 ? page - 1 : null

    // Create the response object
    const data = {
      users: usersWithPostCount,
      pagination: {
        totalDocs: totalDocs,
        limit: perPage,
        page: page,
        totalPages: totalPages,
        pagingCounter: pagingCounter,
        hasPrevPage: page > 1,
        hasNextPage: hasNextPage,
        prevPage: prevPage,
        nextPage: nextPage,
      },
    }


    res.status(200).json({ data });
  } catch (error) {
    res.send({ error: error.message });
  }
};
