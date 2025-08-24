const User = require('../models/User');
const Profile = require('../models/Profile');
const Match = require('../models/Match');

// Get match suggestions based on compatibility
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get current user's profile
    const currentUser = await User.findById(userId).populate('profile');
    if (!currentUser || !currentUser.profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Find potential matches based on preferences and location
    let query = {
      _id: { $ne: userId },
      'profile.isVisible': true
    };

    // Add age range filter if specified
    if (currentUser.preferences.ageRange) {
      query['profile.age'] = {
        $gte: currentUser.preferences.ageRange.min,
        $lte: currentUser.preferences.ageRange.max
      };
    }

    // Add interests filter if specified
    if (currentUser.preferences.interests && currentUser.preferences.interests.length > 0) {
      query['profile.interests'] = {
        $in: currentUser.preferences.interests
      };
    }

    // Find potential matches
    const potentialMatches = await User.find(query)
      .populate('profile')
      .limit(parseInt(limit))
      .select('-emergencyContacts');

    // Calculate compatibility score for each match
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (match) => {
        const compatibility = currentUser.profile.calculateCompatibility(match.profile);
        return {
          user: match.getPublicData(),
          compatibility
        };
      })
    );

    // Sort by compatibility score (highest first)
    matchesWithScores.sort((a, b) => b.compatibility - a.compatibility);

    res.status(200).json({
      success: true,
      suggestions: matchesWithScores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
};

// Like a profile
const likeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    // Check if already liked
    const existingLike = await Match.findOne({
      user: userId,
      targetUser: targetUserId
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Already liked this profile'
      });
    }

    // Create new like
    const like = new Match({
      user: userId,
      targetUser: targetUserId,
      type: 'like'
    });

    await like.save();

    // Check if it's a match (if the other user also liked you)
    const mutualLike = await Match.findOne({
      user: targetUserId,
      targetUser: userId,
      type: 'like'
    });

    if (mutualLike) {
      // It's a match!
      // Create match record
      const match = new Match({
        user: userId,
        targetUser: targetUserId,
        type: 'match'
      });

      await match.save();

      // Notify both users (would use WebSocket in real implementation)
      req.app.get('io').to(userId).emit('new-match', {
        message: 'You have a new match!',
        match: await User.findById(targetUserId).select('username profile')
      });

      req.app.get('io').to(targetUserId).emit('new-match', {
        message: 'You have a new match!',
        match: await User.findById(userId).select('username profile')
      });

      return res.status(200).json({
        success: true,
        message: 'It\'s a match!',
        isMatch: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Like recorded',
      isMatch: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking profile',
      error: error.message
    });
  }
};

module.exports = {
  getSuggestions,
  likeProfile
};