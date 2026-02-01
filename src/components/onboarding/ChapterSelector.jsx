import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { subjects, getChaptersForLevel, hasContentForLevel } from '../../data/syllabus'

export default function ChapterSelector() {
    const { userPreferences, updatePreferences } = useApp()
    const [selectedSubject, setSelectedSubject] = useState(userPreferences.subject || null)
    const [availableChapters, setAvailableChapters] = useState([])
    const [showAllSubtopics, setShowAllSubtopics] = useState({})

    // Filter subjects based on level (Biology not for JEE, Math not for NEET)
    const getAvailableSubjects = () => {
        return subjects.filter(subject => {
            const level = userPreferences.level
            // Check if this subject has content for the selected level
            const subjectName = subject.name
            return hasContentForLevel(subjectName, level)
        })
    }

    useEffect(() => {
        if (selectedSubject && userPreferences.level) {
            const subject = subjects.find(s => s.id === selectedSubject)
            if (!subject) {
                console.error('Subject not found:', selectedSubject)
                setAvailableChapters([])
                return
            }
            const chapters = getChaptersForLevel(subject.name, userPreferences.level)
            setAvailableChapters(chapters)
        } else {
            setAvailableChapters([])
        }
    }, [selectedSubject, userPreferences.level])

    const handleSelectSubject = (subjectId) => {
        setSelectedSubject(subjectId)
        setAvailableChapters([]) // Clear immediately for instant feedback
        updatePreferences({ subject: subjectId, chapters: [] })
    }

    const handleToggleChapter = (chapter) => {
        const currentChapters = userPreferences.chapters || []
        const isSelected = currentChapters.some(c => c.chapterName === chapter.chapterName)

        if (isSelected) {
            updatePreferences({
                chapters: currentChapters.filter(c => c.chapterName !== chapter.chapterName)
            })
        } else {
            updatePreferences({
                chapters: [...currentChapters, chapter]
            })
        }
    }

    const handleSelectAll = () => {
        updatePreferences({ chapters: [...availableChapters] })
    }

    const handleDeselectAll = () => {
        updatePreferences({ chapters: [] })
    }

    const toggleSubtopics = (chapterName) => {
        setShowAllSubtopics(prev => ({
            ...prev,
            [chapterName]: !prev[chapterName]
        }))
    }

    const isChapterSelected = (chapter) => {
        return (userPreferences.chapters || []).some(c => c.chapterName === chapter.chapterName)
    }

    const availableSubjects = getAvailableSubjects()

    return (
        <div className="space-y-8">
            {/* Subject Selection */}
            <div>
                <h3 className="text-lg font-medium text-gray-300 mb-4">Select Subject</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                    {availableSubjects.map((subject, index) => (
                        <motion.button
                            key={subject.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() => handleSelectSubject(subject.id)}
                            className={`
                px-6 py-3 rounded-xl flex items-center gap-3 transition-all
                ${selectedSubject === subject.id
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20'
                                    : 'glass-card hover:border-primary-500/50'
                                }
              `}
                        >
                            <span className="text-2xl">{subject.icon}</span>
                            <span className="font-medium">{subject.name}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Subject availability note */}
                {userPreferences.level === 'neet' && (
                    <p className="text-center text-gray-500 text-sm mt-3">
                        📚 Mathematics is not part of NEET syllabus
                    </p>
                )}
                {(userPreferences.level === 'jee-main' || userPreferences.level === 'jee-advanced') && (
                    <p className="text-center text-gray-500 text-sm mt-3">
                        🧬 Biology chapters available under NEET level
                    </p>
                )}
            </div>

            {/* Chapter Selection */}
            {selectedSubject && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-300">
                            Select Chapters
                            <span className="text-primary-400 ml-2">
                                ({userPreferences.chapters?.length || 0} of {availableChapters.length} selected)
                            </span>
                        </h3>
                        {availableChapters.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-primary-400 hover:text-primary-300"
                                >
                                    Select All
                                </button>
                                <span className="text-gray-600">|</span>
                                <button
                                    onClick={handleDeselectAll}
                                    className="text-sm text-gray-400 hover:text-gray-300"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableChapters.map((chapter, index) => (
                            <motion.div
                                key={chapter.chapterName}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                className={`
                  text-left p-5 rounded-xl transition-all cursor-pointer
                  ${isChapterSelected(chapter)
                                        ? 'bg-gradient-to-r from-primary-500/20 to-primary-700/20 border-2 border-primary-500'
                                        : 'glass-card hover:border-primary-500/30'
                                    }
                `}
                                onClick={() => handleToggleChapter(chapter)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">{chapter.chapterName}</h4>
                                        <p className="text-gray-400 text-sm mb-3">{chapter.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(showAllSubtopics[chapter.chapterName]
                                                ? chapter.subtopics
                                                : chapter.subtopics.slice(0, 3)
                                            ).map((topic, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 rounded-full bg-dark-700 text-gray-400 text-xs"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                            {chapter.subtopics.length > 3 && !showAllSubtopics[chapter.chapterName] && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleSubtopics(chapter.chapterName)
                                                    }}
                                                    className="px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs hover:bg-primary-500/30"
                                                >
                                                    +{chapter.subtopics.length - 3} more
                                                </button>
                                            )}
                                            {showAllSubtopics[chapter.chapterName] && chapter.subtopics.length > 3 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleSubtopics(chapter.chapterName)
                                                    }}
                                                    className="px-2 py-1 rounded-full bg-dark-600 text-gray-400 text-xs hover:bg-dark-500"
                                                >
                                                    show less
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-all
                    ${isChapterSelected(chapter)
                                            ? 'bg-primary-500 text-white'
                                            : 'border-2 border-gray-600'
                                        }
                  `}>
                                        {isChapterSelected(chapter) && <span className="text-sm">✓</span>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {availableChapters.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📚</div>
                            <p className="text-gray-400 mb-2">No chapters available for this combination.</p>
                            <p className="text-gray-500 text-sm">
                                Try selecting a different subject or go back to change your level.
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Helpful tip */}
            {selectedSubject && availableChapters.length > 0 && (
                <p className="text-center text-gray-500 text-sm">
                    💡 Tip: You can select multiple chapters and focus on one at a time during your session
                </p>
            )}
        </div>
    )
}
