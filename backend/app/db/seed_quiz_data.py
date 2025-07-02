from datetime import datetime
from typing import Any, Dict, List

from sqlmodel import Session, select

from app.db.models import Answer, Question, Quiz, QuizQuestion, QuizStatus, Topic
from app.db.session import engine


def create_test_quiz_data(session: Session) -> None:
    """Create test topics, questions, and multiple quizzes for seeding."""
    # Define topics and associated quizzes
    quizzes_data: List[Dict[str, Any]] = [
        {
            "topic": {"title": "General Knowledge", "description": "Test your general knowledge"},
            "quiz": {
                "title": "General Knowledge Quiz",
                "description": "Fun questions across topics",
                "difficulty": 2,
                "time_limit_minutes": 10,
                "status": QuizStatus.PUBLISHED,
            },
            "questions": [
                {"content": "What is the capital of France?", "explanation": "Paris since 987 AD.", "difficulty": 1,
                 "answers": [
                     {"content": "Berlin", "is_correct": False},
                     {"content": "Paris", "is_correct": True},
                     {"content": "Madrid", "is_correct": False},
                     {"content": "Lisbon", "is_correct": False},
                 ]
                 },
                {"content": "What is 2 + 2?", "explanation": "2 + 2 = 4.", "difficulty": 1,
                 "answers": [
                     {"content": "3", "is_correct": False},
                     {"content": "4", "is_correct": True},
                     {"content": "5", "is_correct": False},
                     {"content": "6", "is_correct": False},
                 ]
                 },
                # ... (keep existing 5 or add more) ...
            ],
        },
        {
            "topic": {"title": "Science", "description": "Basic science facts"},
            "quiz": {
                "title": "Science Basics Quiz",
                "description": "General science questions",
                "difficulty": 3,
                "time_limit_minutes": 12,
                "status": QuizStatus.PUBLISHED,
            },
            "questions": [
                {"content": "What is H2O commonly known as?", "explanation": "Chemical formula for water.", "difficulty": 1,
                 "answers": [
                     {"content": "Water", "is_correct": True},
                     {"content": "Hydrogen peroxide", "is_correct": False},
                     {"content": "Salt", "is_correct": False},
                     {"content": "Ozone", "is_correct": False},
                 ]
                 },
                {"content": "What planet is known for its rings?", "explanation": "Saturn's rings are visible from Earth.", "difficulty": 2,
                 "answers": [
                     {"content": "Jupiter", "is_correct": False},
                     {"content": "Saturn", "is_correct": True},
                     {"content": "Uranus", "is_correct": False},
                     {"content": "Neptune", "is_correct": False},
                 ]
                 },
                {"content": "What gas do plants absorb?", "explanation": "Plants use CO2 during photosynthesis.", "difficulty": 2,
                 "answers": [
                     {"content": "Oxygen", "is_correct": False},
                     {"content": "Nitrogen", "is_correct": False},
                     {"content": "Carbon Dioxide", "is_correct": True},
                     {"content": "Hydrogen", "is_correct": False},
                 ]
                 },
                {"content": "What is the center of an atom called?", "explanation": "Atomic nucleus contains protons and neutrons.", "difficulty": 3,
                 "answers": [
                     {"content": "Electron", "is_correct": False},
                     {"content": "Nucleus", "is_correct": True},
                     {"content": "Proton", "is_correct": False},
                     {"content": "Neutron", "is_correct": False},
                 ]
                 },
                {"content": "What force keeps us on the ground?", "explanation": "Gravity attracts masses.", "difficulty": 1,
                 "answers": [
                     {"content": "Magnetism", "is_correct": False},
                     {"content": "Gravity", "is_correct": True},
                     {"content": "Friction", "is_correct": False},
                     {"content": "Acceleration", "is_correct": False},
                 ]
                 },
            ],
        },
        {
            "topic": {"title": "History", "description": "World history events"},
            "quiz": {
                "title": "History Challenge Quiz",
                "description": "Key events in world history",
                "difficulty": 3,
                "time_limit_minutes": 15,
                "status": QuizStatus.PUBLISHED,
            },
            "questions": [
                {"content": "In which year did World War II end?", "explanation": "Ended in 1945.", "difficulty": 3,
                 "answers": [
                     {"content": "1945", "is_correct": True},
                     {"content": "1944", "is_correct": False},
                     {"content": "1946", "is_correct": False},
                     {"content": "1943", "is_correct": False},
                 ]
                 },
                {"content": "Who was the first president of the United States?", "explanation": "George Washington.", "difficulty": 2,
                 "answers": [
                     {"content": "Abraham Lincoln", "is_correct": False},
                     {"content": "George Washington", "is_correct": True},
                     {"content": "Thomas Jefferson", "is_correct": False},
                     {"content": "John Adams", "is_correct": False},
                 ]
                 },
                {"content": "What year did the Berlin Wall fall?", "explanation": "November 9, 1989.", "difficulty": 3,
                 "answers": [
                     {"content": "1989", "is_correct": True},
                     {"content": "1991", "is_correct": False},
                     {"content": "1987", "is_correct": False},
                     {"content": "1990", "is_correct": False},
                 ]
                 },
                {"content": "Who discovered America in 1492?", "explanation": "Christopher Columbus.", "difficulty": 1,
                 "answers": [
                     {"content": "Vasco da Gama", "is_correct": False},
                     {"content": "Christopher Columbus", "is_correct": True},
                     {"content": "Ferdinand Magellan", "is_correct": False},
                     {"content": "James Cook", "is_correct": False},
                 ]
                 },
                {"content": "Which empire built the Colosseum?", "explanation": "Ancient Romans.", "difficulty": 2,
                 "answers": [
                     {"content": "Greek", "is_correct": False},
                     {"content": "Roman", "is_correct": True},
                     {"content": "Egyptian", "is_correct": False},
                     {"content": "Persian", "is_correct": False},
                 ]
                 },
            ],
        },
    ]

    for entry in quizzes_data:
        # Topic
        t_data = entry["topic"]
        topic = session.exec(select(Topic).where(
            Topic.title == t_data["title"]))
        .first()
        if not topic:
            topic = Topic(title=t_data["title"],
                          description=t_data["description"])
            session.add(topic)
            session.commit()
            session.refresh(topic)
            print(f"✅ Created topic: {topic.title}")

        # Questions
        created_questions = []
        for q_data in entry["questions"]:
            existing_q = session.exec(select(Question).where(
                Question.content == q_data["content"]))
            .first()
            if existing_q:
                created_questions.append(existing_q)
                continue

            question = Question(
                topic_id=topic.id,
                content=q_data["content"],
                explanation=q_data["explanation"],
                difficulty=q_data["difficulty"],
            )
            session.add(question)
            session.commit()
            session.refresh(question)

            for a in q_data["answers"]:
                ans = Answer(
                    question_id=question.id,
                    content=a["content"],
                    is_correct=a["is_correct"],
                )
                session.add(ans)
            session.commit()
            created_questions.append(question)
            print(f"✅ Created question: {question.content[:50]}...")

        # Quiz
        qz_data = entry["quiz"]
        existing_quiz = session.exec(
            select(Quiz).where(Quiz.title == qz_data["title"]))
        .first()
        if not existing_quiz:
            quiz = Quiz(
                title=qz_data["title"],
                description=qz_data["description"],
                topic_id=topic.id,
                difficulty=qz_data["difficulty"],
                time_limit_minutes=qz_data["time_limit_minutes"],
                status=qz_data["status"],
                published_at=datetime.utcnow(),
                play_count=0,
            )
            session.add(quiz)
            session.commit()
            session.refresh(quiz)

            for idx, question in enumerate(created_questions):
                qq = QuizQuestion(
                    quiz_id=quiz.id, question_id=question.id, order=idx)
                session.add(qq)
            session.commit()
            print(f"✅ Created quiz: {quiz.title}")


def main() -> None:
    print("🎮 Starting extended quiz seeding...")
    with Session(engine) as session:
        try:
            create_test_quiz_data(session)
            print("🎉 Extended quiz seeding done.")
        except Exception as e:
            print(f"❌ Error: {e}")
            session.rollback()
            raise


if __name__ == "__main__":
    main()
