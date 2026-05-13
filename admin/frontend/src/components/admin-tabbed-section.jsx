import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminTabbedSection({
	title,
	breadcrumbs = [],
	tabs,
	defaultTabId,
	tabListLabel = "Secciones",
}) {
	const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
	const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
	const ActiveIcon = activeTab?.icon;

	if (!activeTab) {
		return null;
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={title}
				breadcrumbs={[
					...breadcrumbs,
					{ label: activeTab.label },
				]}
			/>

			<div className="space-y-4">
				<div
					className="inline-flex rounded-lg border bg-card p-1 shadow-sm"
					role="tablist"
					aria-label={tabListLabel}
				>
					{tabs.map((tab) => {
						const TabIcon = tab.icon;
						const isActive = tab.id === activeTab.id;

						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								aria-selected={isActive}
								aria-controls={`tabbed-section-panel-${tab.id}`}
								id={`tabbed-section-tab-${tab.id}`}
								onClick={() => setActiveTabId(tab.id)}
								className={cn(
									"inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									isActive
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
								)}
							>
								{TabIcon && <TabIcon className="h-4 w-4" />}
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>

				<Card
					id={`tabbed-section-panel-${activeTab.id}`}
					role="tabpanel"
					aria-labelledby={`tabbed-section-tab-${activeTab.id}`}
				>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{ActiveIcon && <ActiveIcon className="h-5 w-5 text-primary" />}
							{activeTab.title}
						</CardTitle>
						{activeTab.description && (
							<CardDescription>{activeTab.description}</CardDescription>
						)}
					</CardHeader>
					<CardContent>{activeTab.content}</CardContent>
				</Card>
			</div>
		</div>
	);
}
