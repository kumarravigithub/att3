/**
 * @typedef {Object} LessonPlanStep
 * @property {number} step
 * @property {string} title
 * @property {string} description
 * @property {string} duration
 */

/**
 * @typedef {Object} Activity
 * @property {string} title
 * @property {string} description
 * @property {string[]} materials
 */

/**
 * @typedef {Object} Assessment
 * @property {string} type
 * @property {string} description
 * @property {string[]} questions
 */

/**
 * @typedef {Object} LearningGap
 * @property {string} gap
 * @property {string} identificationMethod
 * @property {string} remedialAction
 */

/**
 * @typedef {Object} GeneratedContent
 * @property {string[]} learningOutcomes
 * @property {LessonPlanStep[]} lessonPlan
 * @property {Activity[]} activities
 * @property {Assessment[]} assessmentTests
 * @property {LearningGap[]} learningGaps
 */

/**
 * @typedef {'teacher' | 'student'} Role
 */

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} email
 * @property {string} picture
 * @property {string} [title]
 * @property {string} [school]
 * @property {Role} [role]
 */

/**
 * @typedef {Object} ClassInfo
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} teacherId
 * @property {string[]} studentIds
 */

/**
 * @typedef {Object} AnalyzedChapter
 * @property {string} id
 * @property {string} fileName
 * @property {GeneratedContent} content
 * @property {string} createdAt
 * @property {string} teacherId
 * @property {string[]} assignedClassIds
 */

/**
 * @typedef {Object} TestQuestion
 * @property {string} id
 * @property {'multiple-choice' | 'short-answer'} type
 * @property {string} question
 * @property {string[]} [options]
 * @property {string} [correctAnswer]
 */

/**
 * @typedef {Object} Test
 * @property {string} id
 * @property {string} title
 * @property {string} chapterId
 * @property {string} teacherId
 * @property {string[]} topics
 * @property {TestQuestion[]} questions
 * @property {string[]} assignedClassIds
 * @property {string} createdAt
 */

/**
 * @typedef {Object} StudentAnswer
 * @property {string} questionId
 * @property {string} answer
 */

/**
 * @typedef {Object} StudentTestAttempt
 * @property {string} id
 * @property {string} testId
 * @property {string} studentId
 * @property {StudentAnswer[]} answers
 * @property {number} score
 * @property {string} submittedAt
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {string[]} remedialSuggestions
 * @property {string} overallFeedback
 */

/**
 * @typedef {Object} ClassAnalysisResult
 * @property {string} overallPerformanceSummary
 * @property {string[]} commonMisconceptions
 * @property {Array<{question: string, incorrectPercentage: number}>} mostDifficultQuestions
 */

// Export types for use in JSDoc
export {};

