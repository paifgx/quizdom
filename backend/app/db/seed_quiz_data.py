"""Seed quiz data for testing the game functionality."""

from sqlmodel import Session, select
from app.db.models import Topic, Question, Answer, Quiz, QuizQuestion, QuizStatus
from app.db.session import engine
from datetime import datetime


def create_test_quiz_data(session: Session) -> None:
    """Create test topics, questions, and quizzes."""

    # Create a test topic
    topic = session.exec(
        select(Topic).where(Topic.title == "General Knowledge")
    ).first()
    if not topic:
        topic = Topic(
            title="General Knowledge",
            description="Test your general knowledge with these questions",
        )
        session.add(topic)
        session.commit()
        session.refresh(topic)
        print(f"✅ Created topic: {topic.title}")

    # Create test questions with answers
    test_questions = [
        {
            "content": "What is the capital of France?",
            "explanation": "Paris has been the capital of France since 987 AD.",
            "difficulty": 1,
            "answers": [
                {"content": "Berlin", "is_correct": False},
                {"content": "Paris", "is_correct": True},
                {"content": "Madrid", "is_correct": False},
                {"content": "Lisbon", "is_correct": False},
            ],
        },
        {
            "content": "What is 2 + 2?",
            "explanation": "Basic arithmetic: 2 + 2 = 4",
            "difficulty": 1,
            "answers": [
                {"content": "3", "is_correct": False},
                {"content": "4", "is_correct": True},
                {"content": "5", "is_correct": False},
                {"content": "6", "is_correct": False},
            ],
        },
        {
            "content": "Which planet is known as the Red Planet?",
            "explanation": "Mars appears red due to iron oxide on its surface.",
            "difficulty": 2,
            "answers": [
                {"content": "Venus", "is_correct": False},
                {"content": "Mars", "is_correct": True},
                {"content": "Jupiter", "is_correct": False},
                {"content": "Saturn", "is_correct": False},
            ],
        },
        {
            "content": "What is the largest ocean on Earth?",
            "explanation": "The Pacific Ocean covers about 63 million square miles.",
            "difficulty": 2,
            "answers": [
                {"content": "Atlantic", "is_correct": False},
                {"content": "Indian", "is_correct": False},
                {"content": "Arctic", "is_correct": False},
                {"content": "Pacific", "is_correct": True},
            ],
        },
        {
            "content": "Who painted the Mona Lisa?",
            "explanation": "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.",
            "difficulty": 2,
            "answers": [
                {"content": "Van Gogh", "is_correct": False},
                {"content": "Picasso", "is_correct": False},
                {"content": "Da Vinci", "is_correct": True},
                {"content": "Rembrandt", "is_correct": False},
            ],
        },
        {
            "content": "What is the chemical symbol for gold?",
            "explanation": "Au comes from the Latin word for gold, 'aurum'.",
            "difficulty": 3,
            "answers": [
                {"content": "Go", "is_correct": False},
                {"content": "Gd", "is_correct": False},
                {"content": "Au", "is_correct": True},
                {"content": "Ag", "is_correct": False},
            ],
        },
        {
            "content": "In which year did World War II end?",
            "explanation": "World War II ended in 1945 with the surrender of Japan.",
            "difficulty": 3,
            "answers": [
                {"content": "1943", "is_correct": False},
                {"content": "1944", "is_correct": False},
                {"content": "1945", "is_correct": True},
                {"content": "1946", "is_correct": False},
            ],
        },
        {
            "content": "What is the speed of light in vacuum?",
            "explanation": "The speed of light in vacuum is exactly 299,792,458 meters per second.",
            "difficulty": 4,
            "answers": [
                {"content": "300,000 km/s", "is_correct": True},
                {"content": "150,000 km/s", "is_correct": False},
                {"content": "500,000 km/s", "is_correct": False},
                {"content": "1,000,000 km/s", "is_correct": False},
            ],
        },
        {
            "content": "Which programming language was created by Guido van Rossum?",
            "explanation": "Python was created by Guido van Rossum and first released in 1991.",
            "difficulty": 3,
            "answers": [
                {"content": "Java", "is_correct": False},
                {"content": "Python", "is_correct": True},
                {"content": "Ruby", "is_correct": False},
                {"content": "JavaScript", "is_correct": False},
            ],
        },
        {
            "content": "What is the largest planet in our solar system?",
            "explanation": "Jupiter is the largest planet with a radius of about 70,000 km.",
            "difficulty": 2,
            "answers": [
                {"content": "Saturn", "is_correct": False},
                {"content": "Neptune", "is_correct": False},
                {"content": "Jupiter", "is_correct": True},
                {"content": "Uranus", "is_correct": False},
            ],
        },
    ]

    created_questions = []
    for q_data in test_questions:
        # Check if question already exists
        existing = session.exec(
            select(Question).where(Question.content == q_data["content"])
        ).first()

        if not existing and topic.id is not None:
            question = Question(
                topic_id=topic.id,
                content=q_data["content"],
                explanation=q_data["explanation"],
                difficulty=q_data["difficulty"],
            )
            session.add(question)
            session.commit()
            session.refresh(question)

            # Add answers
            if question.id is not None:
                for a_data in q_data["answers"]:
                    answer = Answer(
                        question_id=question.id,
                        content=a_data["content"],
                        is_correct=a_data["is_correct"],
                    )
                    session.add(answer)

            session.commit()
            created_questions.append(question)
            print(f"✅ Created question: {question.content[:50]}...")

    # Create a published quiz
    quiz = session.exec(
        select(Quiz).where(Quiz.title == "General Knowledge Quiz")
    ).first()

    if not quiz and created_questions and topic.id is not None:
        quiz = Quiz(
            title="General Knowledge Quiz",
            description="Test your knowledge with these fun questions!",
            topic_id=topic.id,
            difficulty=2,
            time_limit_minutes=10,
            status=QuizStatus.PUBLISHED,
            published_at=datetime.utcnow(),
            play_count=0,
        )
        session.add(quiz)
        session.commit()
        session.refresh(quiz)

        # Add questions to quiz
        if quiz.id is not None:
            # Use first 5 questions
            for i, question in enumerate(created_questions[:5]):
                if question.id is not None:
                    quiz_question = QuizQuestion(
                        quiz_id=quiz.id, question_id=question.id, order=i
                    )
                    session.add(quiz_question)

        session.commit()
        print(f"✅ Created and published quiz: {quiz.title}")


def main():
    """Run the quiz data seeding."""
    print("🎮 Starting quiz data seeding...")

    with Session(engine) as session:
        try:
            create_test_quiz_data(session)
            print("🎉 Quiz data seeding completed successfully!")
            print("\n📋 Created:")
            print("├── Topic: General Knowledge")
            print("├── Questions: 10 questions with 4 answers each")
            print("└── Quiz: General Knowledge Quiz (published)")

        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            session.rollback()
            raise


if __name__ == "__main__":
    main()
