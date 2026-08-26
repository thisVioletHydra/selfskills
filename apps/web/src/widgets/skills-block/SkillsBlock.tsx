import { SKILL_GROUPS } from '#web/entities/skill/skill-groups';
import '#web/widgets/skills-block/skills-block.css';

export function SkillsBlock() {
  return (
    <section className="cosmos-section" id="skills">
      <div className="stars" aria-hidden="true" />
      <div className="inner">
        <p className="tag">skills</p>
        <h2 className="title">Тот же стек, списком</h2>
        <p className="sub">
          Всё, что крутится вокруг JS наверху — из реального опыта, не из wishlist. Жми иконки в
          hero, если нужна карточка.
        </p>

        <div className="skills">
          {SKILL_GROUPS.map((group) => (
            <div key={group.id} className="group">
              <h3 className="label">{group.title}</h3>
              <ul className="list">
                {group.items.map((item) => (
                  <li key={item} className="item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
